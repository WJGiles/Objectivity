import React from "react";
import { Button, FormControlLabel } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import "./ConfigForm.css";

class NewClassField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    };
  }

  handleTextFieldChange(e) {
    this.setState({
      value: e.target.value
    });
    this.props.passvalueup(e.target.value);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const add = nextProps.added;
    if (add) {
      this.setState(prevState => ({ value: "" }));
      this.props.resetadded();
    }

    return true;
  }

  render() {
    return (
      <TextField
        {...this.props}
        value={this.state.value}
        onChange={this.handleTextFieldChange.bind(this)}
      />
    );
  }
}

class ConfigForm extends React.Component {
  constructor(props) {
    super(props);
    if (props.config_list.length > 0) {
      let targetConfig = props.config_list[0];
      let classnames_with_keys = [];
      for (var i = 0; i < targetConfig.classnames.length; i++) {
        classnames_with_keys.push({
          id: i,
          textValue: targetConfig.classnames[i]
        });
      }
      this.state = {
        dataSetName: targetConfig.dataSetName,
        dataSetFolder: targetConfig.dataSetFolder,
        randomizeOrder: true,
        userName: null,
        recursiveFlag: true,
        findJpeg: true,
        findPng: true,
        wholeImageLabels: targetConfig.wholeImageLabels,
        fileList: targetConfig.fileList,
        newClassName: "",
        classnames: classnames_with_keys,
        textField: {
          marginLeft: 30,
          marginRight: 30,
          width: 200
        },
        added: false,
        edited: false,
        preExisting: false,
        newConfigDisplayVal: props.showFullConfigForm ? "block" : "none"
      };
    } else {
      this.state = {
        dataSetName: "Snart",
        dataSetFolder: "/jam/sandwich/",
        randomizeOrder: false,
        recursiveFlag: true,
        fileList: [],
        newClassName: "",
        classnames: [{ id: 0, textValue: "marmalade" }],
        textField: {
          marginLeft: 30,
          marginRight: 30,
          width: 200
        },
        added: false,
        newConfigDisplayVal: "none"
      };
    }
  }

  handleDataSetNameChange(e) {
    this.setState({
      dataSetName: e.target.value,
      edited: true
    });
  }

  handleSelect(e) {
    let config_list_ind = this.getIndexOfSelectedConfig(e.target.value);

    let targetConfig = this.props.config_list[config_list_ind];
    console.log("targetConfig");

    let classnames_with_keys = [];
    let fileList = [];
    var dataSetName, dataSetFolder, wholeImageLabels;
    var randomizeOrder = false;
    var preExisting = false;

    if (targetConfig) {
      for (var i = 0; i < targetConfig.classnames.length; i++) {
        classnames_with_keys.push({
          id: i,
          textValue: targetConfig.classnames[i]
        });
      }
      if (targetConfig.hasOwnProperty("randomizeOrder")) {
        randomizeOrder = targetConfig.randomizeOrder;
      }
      dataSetName = targetConfig.dataSetName;
      dataSetFolder = targetConfig.dataSetFolder;
      wholeImageLabels = targetConfig.wholeImageLabels;
      fileList = targetConfig.fileList;
      preExisting = true;
    } else {
      dataSetName = "";
      dataSetFolder = "";
    }
    console.log(dataSetName);
    console.log(dataSetFolder);
    this.setState({
      dataSetName: dataSetName,
      dataSetFolder: dataSetFolder,
      randomizeOrder: randomizeOrder,
      wholeImageLabels: wholeImageLabels,
      recursiveFlag: true,
      fileList: fileList,
      newClassName: "",
      classnames: classnames_with_keys,
      textField: {
        marginLeft: 30,
        marginRight: 30,
        width: 200
      },
      added: false,
      preExisting: preExisting,
      edited: false,
      newConfigDisplayVal: "block"
    });
    this.props.toggleShowFullConfigForm();
  }

  handleDataSetFolderChange(e) {
    this.setState({
      dataSetFolder: e.target.value,
      edited: true
    });
  }

  handleTextFieldChange(e) {
    this.setState({
      newClassName: e.target.value,
      edited: true
    });
  }

  handleRecursiveChange(e) {
    this.setState({
      recursiveFlag: e.target.checked,
      edited: true
    });
  }

  handleRandomizeChange(e) {
    this.setState({
      randomizeOrder: e.target.checked,
      edited: true
    });
  }

  handleWholeImageChange(e) {
    this.setState({
      wholeImageLabels: e.target.checked,
      edited: true
    });
  }

  handleExtChange = name => event => {
    this.setState({ [name]: event.target.checked, edited: true });
  };

  handleUserNameChange(e) {
    this.setState({
      userName: e.target.value
    });
  }

  addButtonClick() {
    let newClass = {
      id: this.state.classnames.length + 1,
      textValue: this.state.newClassName
    };

    this.setState(prevState => ({
      classnames: [...prevState.classnames, newClass],
      newClassName: "New Class...",
      added: true,
      edited: true
    }));
  }

  setNewClassName(cName) {
    this.setState({
      newClassName: cName
    });
  }

  resetAdded() {
    this.setState(prevState => ({
      classnames: prevState.classnames,
      added: false
    }));
  }

  getIndexOfSelectedConfig(configName) {
    for (var i = 0; i < this.props.config_list.length; i++) {
      if (this.props.config_list[i].dataSetName === configName) {
        return i;
      }
    }
  }

  render() {
    return (
      <div className="rowContainer">
        <div className="container">
          <div>
            <b> User Name</b>
          </div>
          <div>
            <TextField
              id="dataSetFolder"
              onChange={this.handleUserNameChange.bind(this)}
              placeholder="Jimmy Label"
              defaultValue={""}
              value={this.state.userName}
              className="textField"
            />
          </div>
          <div>
            <b> Dataset Configuration </b>
          </div>
          <div className="buttonHolder">
            <Select
              className="textField"
              value={this.state.dataSetName}
              onChange={this.handleSelect.bind(this)}
              style={{ backgroundColor: "white" }}
              inputProps={{
                name: "Dataset Select",
                id: "dataset-select",
                variant: "filled"
              }}
            >
              <MenuItem
                value="New"
                style={{
                  backgroundColor: "white",
                  selected: { backgroundColor: "green" }
                }}
              >
                <em>New</em>
              </MenuItem>
              {this.props.config_list.map(config => (
                <MenuItem
                  key={config._id}
                  value={config.dataSetName}
                  style={{ backgroundColor: "white" }}
                >
                  {config.dataSetName}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div
            style={{
              display: this.props.showFullConfigForm ? "block" : "none"
            }}
          >
            <div>
              <TextField
                label="Dataset Name"
                id="dataSetName"
                onChange={this.handleDataSetNameChange.bind(this)}
                placeholder="DatasetOne"
                defaultValue={this.state.dataSetName}
                value={this.state.dataSetName}
                className="textField"
              />
            </div>
            <div>
              <TextField
                label="Dataset Folder"
                id="dataSetFolder"
                onChange={this.handleDataSetFolderChange.bind(this)}
                placeholder="/home/myName/myPicDir"
                defaultValue={this.state.dataSetFolder}
                value={this.state.dataSetFolder}
                className="textField"
              />
            </div>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.recursiveFlag}
                    onChange={this.handleRecursiveChange.bind(this)}
                    value="recursive"
                  />
                }
                label="Recurse Through Folder"
              />
            </div>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.wholeImageLabels}
                    onChange={this.handleWholeImageChange.bind(this)}
                    value="wholeImage"
                  />
                }
                label="Image-level labels rather than bboxes"
              />
            </div>
            <div>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.findJpeg}
                      onChange={this.handleExtChange("findJpeg")}
                      value="findJpeg"
                    />
                  }
                  label="jpeg"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.findPng}
                      onChange={this.handleExtChange("findPng")}
                      value="findPng"
                    />
                  }
                  label="png"
                />
              </FormGroup>
            </div>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.randomizeOrder}
                    onChange={this.handleRandomizeChange.bind(this)}
                    value="randomize"
                  />
                }
                label="Randomize image ordering"
              />
            </div>
            <div className="container">Object Class List</div>
            <div className="container">
              <div className="container">
                {this.state.classnames.map(classname => (
                  <TextField
                    key={classname.id}
                    fullWidth={false}
                    value={classname.textValue}
                    className="textField"
                  />
                ))}
                <NewClassField
                  passvalueup={this.setNewClassName.bind(this)}
                  resetadded={this.resetAdded.bind(this)}
                  added={this.state.added ? 1 : 0}
                  placeholder="New Class..."
                  helperText="An Object Class"
                />
              </div>
            </div>
            <div>
              <div className="buttonHolder">
                <Button
                  variant="contained"
                  onClick={this.addButtonClick.bind(this)}
                  color="primary"
                >
                  Add Class
                </Button>
              </div>
              <div className="buttonHolder">
                <Button
                  variant="contained"
                  onClick={() => this.props.handleConfigChoose(this.state)}
                  color="primary"
                  disabled={
                    this.state.preExisting && !this.state.edited ? false : true
                  }
                >
                  Choose Config & Start
                </Button>
              </div>
              <div className="buttonHolder">
                <Button
                  variant="contained"
                  onClick={() => this.props.handleConfigSave(this.state)}
                  color="primary"
                  disabled={this.state.edited ? 0 : 1}
                >
                  Save Config & Start
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ConfigForm;

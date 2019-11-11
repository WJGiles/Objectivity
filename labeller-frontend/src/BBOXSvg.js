import React from "react";
import { Button, CardContent } from "@material-ui/core";
import Radio from "@material-ui/core/Radio";
import Select from "@material-ui/core/Select";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import "./BBOXSvg.css";
import SubmitStepper from "./SubmitStepper.js";
import { HotKeys } from "react-hotkeys";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import { createMuiTheme } from "@material-ui/core/styles";
import purple from "@material-ui/core/colors/purple";
import green from "@material-ui/core/colors/green";

const keyMap = {
  moveUp: "up",
  moveRight: "right",
  moveLeft: "left",
  setLabel1: "1",
  setLabel2: "2",
  setLabel3: "3",
  setLabel4: "4",
  setLabel5: "5",
  setLabel6: "6",
  setLabel7: "7",
  setLabel8: "8",
  setLabel9: "9",
  setLabel10: "0"
};

const cardTheme = createMuiTheme({
  palette: {
    primary: green,
    secondary: purple,
    background: {
      paper: green
    },
    type: "light"
  },
  typography: {
    fontSize: 20
  }
});

class BBOXSvg extends React.Component {
  constructor(props) {
    super(props);

    this.onLoad = this.handleImageLoad.bind(this);
    this.svgRef = React.createRef();
    this.state = {
      labeller_state: props.labeller_state,
      config_state: props.config_state,
      img_state: { img_width: props.img_width, img_height: props.img_height }
    };
  }

  handleImageLoad({ target: img }) {
    console.log("Image load: ");
    console.log(this.props.labeller_state.wholeImageLabel);
    this.setState(prevState => ({
      labeller_state: {
        mouseIsDown: false,
        bboxStartX: null,
        bboxStartY: null,
        value: prevState.labeller_state.value,
        wholeImageLabel: this.props.labeller_state.wholeImageLabel,
        bboxes: this.state.labeller_state.bboxes,
        classnames: prevState.labeller_state.classnames,
        pathIndex: prevState.labeller_state.pathIndex,
        userName: this.props.labeller_state.userName
      },
      config_state: prevState.config_state,
      img_state: { img_width: img.width, img_height: img.height }
    }));
  }

  getImgRelCoords() {
    const svg = this.svgRef.current;
    const rect = svg.getBoundingClientRect();

    return rect;
  }

  getCursorPosition(event) {
    const svg = this.svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return { x: x, y: y };
  }

  mouseDown(e) {
    let pos = this.getCursorPosition(e);

    this.props.labellerMouseDown(pos);
  }

  mouseClick(e) {
    let pos = this.getCursorPosition(e);
    const newId = this.props.labeller_state.bboxes.length + 1;
    let width = 0,
      height = 0,
      x = 0,
      y = 0;

    if (
      pos.x - this.props.labeller_state.bboxStartX > 0 &&
      pos.y - this.props.labeller_state.bboxStartY > 0
    ) {
      width = pos.x - this.props.labeller_state.bboxStartX;
      height = pos.y - this.props.labeller_state.bboxStartY;
      x = this.props.labeller_state.bboxStartX;
      y = this.props.labeller_state.bboxStartY;
    } else {
      width = this.props.labeller_state.bboxStartX - pos.x;
      height = this.props.labeller_state.bboxStartY - pos.y;
      x = pos.x;
      y = pos.y;
    }

    let widthScaleFactor =
      this.state.img_state.img_width / this.props.svg_width;
    let heightScaleFactor =
      this.state.img_state.img_height / this.props.svg_height;

    let newBbox = {
      id: newId,
      classname: this.props.labeller_state.value,
      x: x,
      y: y,
      width: width,
      height: height,
      widthScaleFactor: widthScaleFactor,
      heightScaleFactor: heightScaleFactor
    };

    this.props.addBbox(newBbox);
  }

  deleteBbox(index) {
    let oldBboxes = this.props.labeller_state.bboxes;
    oldBboxes.splice(index - 1, 1);
    for (var i = index - 1; i < oldBboxes.length; i++) {
      oldBboxes[i].id -= 1;
    }

    this.props.deleteBbox(oldBboxes);
  }

  deleteWholeImageLabel() {
    this.props.deleteWholeImageLabel();
  }

  handleChange(event) {
    this.props.handleClassButtonChange(event);
  }

  handleReviewClassSelect(event) {
    this.props.handleReviewClassSelect(event.target.value);
    if (this.props.reviewModeOn) {
      this.props.updateFileListForReview();
    }
  }

  skipToFirstUnlabelled() {
    this.props.skipToFirstUnlabelled();
  }

  toggleReviewModeOn() {
    this.props.toggleReviewModeOn();
  }

  render() {
    const handlers = {
      moveUp: event => console.log("Move up hotkey called!"),
      moveRight: this.props.handleSubmitStep,
      moveLeft: this.props.handleSubmitBackStep,
      setLabel1: this.props.handleClassButtonChangeByIndex.bind(this, 0),
      setLabel2: this.props.handleClassButtonChangeByIndex.bind(this, 1),
      setLabel3: this.props.handleClassButtonChangeByIndex.bind(this, 2),
      setLabel4: this.props.handleClassButtonChangeByIndex.bind(this, 3),
      setLabel5: this.props.handleClassButtonChangeByIndex.bind(this, 4),
      setLabel6: this.props.handleClassButtonChangeByIndex.bind(this, 5),
      setLabel7: this.props.handleClassButtonChangeByIndex.bind(this, 6),
      setLabel8: this.props.handleClassButtonChangeByIndex.bind(this, 7),
      setLabel9: this.props.handleClassButtonChangeByIndex.bind(this, 8),
      setLabel10: this.props.handleClassButtonChangeByIndex.bind(this, 9)
    };

    let viewbox_string =
      "0 0 " +
      String(this.props.svg_width) +
      " " +
      String(this.props.svg_height);
    if (this.props.showBboxSvg) {
      return (
        <div>
          <HotKeys keyMap={keyMap} handlers={handlers}>
            <div className="box-annotator">
              <div className="class-listing">
                <ol>
                  <FormControl component="fieldset" className="classes-control">
                    <div>
                      <b>
                        {" "}
                        Dataset Name: {this.props.config_state.dataSetName}{" "}
                      </b>
                    </div>
                    <b>Object Types:</b>
                    <RadioGroup
                      aria-label="gender"
                      name="gender2"
                      className="classesGroup"
                      value={this.props.labeller_state.value}
                      onChange={this.handleChange.bind(this)}
                    >
                      {this.props.labeller_state.classnames.map(class_name => (
                        <FormControlLabel
                          key={class_name}
                          value={class_name}
                          control={<Radio color="primary" />}
                          label={
                            "[" +
                            (
                              this.props.labeller_state.classnames.indexOf(
                                class_name
                              ) + 1
                            ).toString() +
                            "] " +
                            class_name
                          }
                          labelplacement="start"
                        />
                      ))}
                      />
                    </RadioGroup>
                  </FormControl>
                </ol>
              </div>
              <div className="svg-column">
                <div style={{ marginTop: 15, marginBottom: 20 }}>
                  <b>
                    {" "}
                    Current Path:{" "}
                    <a href={this.props.path}> {this.props.path} </a>, User
                    Name: {this.props.labeller_state.userName}
                  </b>
                </div>
                <div>
                  <svg
                    ref={this.svgRef}
                    viewBox={viewbox_string}
                    width={this.props.svg_width}
                    height={this.props.svg_height}
                    onMouseDown={this.mouseDown.bind(this)}
                    onClick={this.mouseClick.bind(this)}
                  >
                    <image
                      height={"100%"}
                      width={"100%"}
                      preserveAspectRatio="none"
                      href={this.props.path}
                    />
                    {this.props.labeller_state.bboxes.map(bbox => (
                      <g key={bbox.id}>
                        <rect
                          className={"class1"}
                          x={bbox.x}
                          y={bbox.y}
                          width={bbox.width}
                          height={bbox.height}
                        />
                        <text
                          x={bbox.x}
                          y={bbox.y + 20}
                          fontFamily={"Verdana"}
                          fontSize={"25"}
                          fill={"green"}
                        >
                          {bbox.id}
                        </text>
                      </g>
                    ))}
                    Sorry, your browser does not support inline SVG.
                  </svg>
                  <img
                    // It's annoying that I need this to get
                    // the image dims out...
                    src={this.props.path}
                    onLoad={this.onLoad}
                    style={{ display: "none" }}
                    alt={""}
                  />
                </div>
              </div>
              <div className="box-listing">
                <ol>
                  <b>Current BBOXES:</b>
                  {this.props.labeller_state.bboxes.map(bbox => (
                    <li key={bbox.id}>
                      <Button
                        variant="contained"
                        color="primary"
                        boxid={bbox.id}
                        onClick={this.deleteBbox.bind(this, bbox.id)}
                      >
                        {bbox.classname}
                      </Button>
                    </li>
                  ))}
                </ol>
                <ol>
                  <div
                    style={{
                      display: this.props.config_state.wholeImageLabels
                        ? "block"
                        : "none"
                    }}
                  >
                    <b>Current whole image label:</b>
                    <div>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        disabled={
                          this.props.labeller_state.wholeImageLabel === null
                            ? true
                            : false
                        }
                        onClick={this.deleteWholeImageLabel.bind(this)}
                      >
                        {this.props.labeller_state.wholeImageLabel}
                      </Button>
                    </div>
                  </div>
                </ol>
                <ol>
                  <div
                    style={{
                      display: this.props.config_state.wholeImageLabels
                        ? "block"
                        : "none"
                    }}
                  >
                    <b>Review Mode:</b>
                    <div className="buttonHolder">
                      <Select
                        className="textField"
                        value={this.props.reviewClass}
                        onChange={this.handleReviewClassSelect.bind(this)}
                        style={{ backgroundColor: "white" }}
                        inputProps={{
                          name: "Review Class Select",
                          id: "review-class-select",
                          variant: "filled"
                        }}
                      >
                        {this.props.labeller_state.classnames.map(classname => (
                          <MenuItem
                            key={classname}
                            value={classname}
                            style={{ backgroundColor: "white" }}
                          >
                            {classname}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={this.toggleReviewModeOn.bind(this)}
                      >
                        {this.props.reviewModeOn
                          ? "Stop Review"
                          : "Start Review"}
                      </Button>
                    </div>
                    <div></div>
                    <div
                      style={{
                        display: this.props.reviewModeOn ? "block" : "none"
                      }}
                    >
                      <MuiThemeProvider theme={cardTheme}>
                        <Card className="card">
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Reviewing Class:
                            </Typography>
                            <Typography>{this.props.reviewClass}</Typography>
                          </CardContent>
                        </Card>
                      </MuiThemeProvider>
                    </div>
                  </div>
                </ol>
              </div>
            </div>
            <div className="rowContainer">
              <div className="rowItem">
                <SubmitStepper
                  labeller_state={this.props.labeller_state}
                  config_state={this.props.config_state}
                  handleSubmitStep={this.props.handleSubmitStep}
                  handleSubmitBackStep={this.props.handleSubmitBackStep}
                />
              </div>
              <div className="rowItem">
                Showing image number {this.props.labeller_state.pathIndex + 1}{" "}
                out of {this.props.config_state.fileList.length}
              </div>
              <div className="rowItem">
                <Button onClick={this.skipToFirstUnlabelled.bind(this)}>
                  {" "}
                  Skip to first unlabelled >>{" "}
                </Button>
              </div>
            </div>
          </HotKeys>
        </div>
      );
    } else {
      return (
        <div className="svgBoxContainer">
          <img
            src={process.env.PUBLIC_URL + "/boosh_test_card_1000x800.jpg"}
          ></img>
        </div>
      );
    }
  }
}

export default BBOXSvg;

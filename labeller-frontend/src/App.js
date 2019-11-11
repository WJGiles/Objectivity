import React, { Component } from "react";
import {
  AppBar,
  Toolbar,
  Paper,
  IconButton,
  Typography
} from "@material-ui/core";
import ThumbIcon from "./ThumbIcon.js";
import CssBaseline from "@material-ui/core/CssBaseline";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import { createMuiTheme } from "@material-ui/core/styles";
import purple from "@material-ui/core/colors/purple";
import green from "@material-ui/core/colors/green";
import ConfigForm from "./ConfigForm.js";
import BBOXSvg from "./BBOXSvg.js";
import superagent from "superagent";
import { HotKeys } from "react-hotkeys";

const SVG_WIDTH = process.env.REACT_APP_SVG_WIDTH || 1536;
const SVG_HEIGHT = process.env.REACT_APP_SVG_HEIGHT || 1024;

const muiTheme = createMuiTheme({
  palette: {
    primary: green,
    secondary: purple,
    background: {
      paper: green
    },
    type: "light"
  },
  typography: {
    fontSize: 14
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labeller_state: {
        mouseIsDown: false,
        bboxStartX: null,
        bboxStartY: null,
        path: "",
        bboxes: [],
        wholeImageLabel: null,
        classnames: ["class1", "class2"],
        pathIndex: 0,
        value: "",
        userName: "Anonymous"
      },
      config_state: {
        dataSetName: null,
        dataSetFolder: null,
        randomizeOrder: false,
        wholeImageLabels: false,
        classnames: [],
        fileList: [],
        fullFileList: []
      },
      img_state: { img_width: null, img_height: null },
      config_list: [],
      showBboxSvg: false,
      showFullConfigForm: false,
      reviewModeOn: false,
      reviewClass: null
    };
    this.getConfigList();
  }

  addBbox(newBbox) {
    this.setState(prevState => ({
      labeller_state: {
        mouseIsDown: false,
        bboxStartX: null,
        bboxStartY: null,
        value: prevState.labeller_state.value,
        bboxes: [...prevState.labeller_state.bboxes, newBbox],
        classnames: prevState.labeller_state.classnames,
        pathIndex: prevState.labeller_state.pathIndex,
        userName: prevState.labeller_state.userName,
        wholeImageLabel: prevState.labeller_state.wholeImageLabel
      },
      config_state: prevState.config_state,
      img_state: prevState.img_state
    }));
  }

  deleteBbox(oldBboxes) {
    this.setState(prevState => ({
      labeller_state: {
        mouseIsDown: false,
        bboxStartX: null,
        bboxStartY: null,
        value: prevState.labeller_state.value,
        bboxes: oldBboxes,
        classnames: prevState.labeller_state.classnames,
        pathIndex: prevState.labeller_state.pathIndex
      },
      config_state: prevState.config_state,
      img_state: prevState.img_state
    }));
  }

  deleteWholeImageLabel() {
    this.setState(prevState => ({
      labeller_state: {
        mouseIsDown: false,
        bboxStartX: null,
        bboxStartY: null,
        value: prevState.labeller_state.value,
        wholeImageLabel: null,
        bboxes: prevState.labeller_state.bboxes,
        classnames: prevState.labeller_state.classnames,
        pathIndex: prevState.labeller_state.pathIndex
      },
      config_state: prevState.config_state,
      img_state: prevState.img_state,
      userName: prevState.labeller_state.userName
    }));
  }

  handleClassButtonChange(event) {
    if (this.state.config_state.wholeImageLabels) {
      this.setState({
        labeller_state: {
          wholeImageLabel: event.target.value,
          value: event.target.value,
          mouseIsDown: false,
          bboxStartX: null,
          bboxStartY: null,
          bboxes: this.state.labeller_state.bboxes,
          classnames: this.state.labeller_state.classnames,
          pathIndex: this.state.labeller_state.pathIndex,
          userName: this.state.labeller_state.userName
        },
        config_state: this.state.config_state
      });
    } else {
      this.setState({
        labeller_state: {
          value: event.target.value,
          mouseIsDown: false,
          bboxStartX: null,
          bboxStartY: null,
          bboxes: this.state.labeller_state.bboxes,
          classnames: this.state.labeller_state.classnames,
          pathIndex: this.state.labeller_state.pathIndex,
          userName: this.state.labeller_state.userName
        },
        config_state: this.state.config_state
      });
    }
  }

  handleClassButtonChangeByIndex(index) {
    console.log("Hotkey label change...");
    if (index <= this.state.labeller_state.classnames.length) {
      if (this.state.config_state.wholeImageLabels) {
        this.setState({
          labeller_state: {
            wholeImageLabel: this.state.labeller_state.classnames[index],
            value: this.state.labeller_state.classnames[index],
            mouseIsDown: false,
            bboxStartX: null,
            bboxStartY: null,
            bboxes: this.state.labeller_state.bboxes,
            classnames: this.state.labeller_state.classnames,
            pathIndex: this.state.labeller_state.pathIndex,
            userName: this.state.labeller_state.userName
          },
          config_state: this.state.config_state
        });
      } else {
        this.setState({
          labeller_state: {
            value: this.state.labeller_state.classnames[index],
            mouseIsDown: false,
            bboxStartX: null,
            bboxStartY: null,
            bboxes: this.state.labeller_state.bboxes,
            classnames: this.state.labeller_state.classnames,
            pathIndex: this.state.labeller_state.pathIndex,
            userName: this.state.labeller_state.userName
          },
          config_state: this.state.config_state
        });
      }
    }
  }

  toggleShowFullConfigForm() {
    this.setState(prevState => ({
      showFullConfigForm: prevState.showFullConfigForm ? false : true
    }));
  }

  toggleReviewModeOn() {
    let newVal = this.state.reviewModeOn ? false : true;
    if (newVal) {
      this.setState(prevState => ({
        reviewModeOn: true
      }));
      this.updateFileListForReview();
    } else {
      this.setState(prevState => ({
        reviewModeOn: false,
        config_state: {
          ...prevState.config_state,
          fileList: prevState.config_state.fullFileList
        }
      }));
      console.log("Previous fullFileList");
      console.log(this.state.config_state.fullFileList);
      superagent
        .get(process.env.REACT_APP_BACKEND_URI + "/labellerExistingImage")
        .query({
          dataSetName: this.state.config_state.dataSetName,
          dataSetFolder: this.state.config_state.dataSetFolder,
          path: this.state.config_state.fullFileList[0]
        })
        .end((err, res) => {
          var unscaled_bboxes = [];
          var wholeImageLabel = null;
          if (res.body.metaData) {
            unscaled_bboxes = this.getUnscaledBboxes(res.body.metaData.bboxes);
            if (res.body.metaData.wholeImageLabel) {
              wholeImageLabel = res.body.metaData.wholeImageLabel;
            }
          }
          this.setState(prevState => ({
            labeller_state: {
              ...prevState.labeller_state,
              bboxes: unscaled_bboxes,
              mouseIsDown: false,
              bboxStartX: null,
              bboxStartY: null,
              wholeImageLabel: wholeImageLabel,
              pathIndex: 0
            }
          }));
        });
    }
  }

  handleReviewClassSelect(classname) {
    this.setState(prevState => ({
      reviewClass: classname
    }));
  }

  labellerMouseDown(pos) {
    this.setState(prevState => ({
      labeller_state: {
        mouseIsDown: true,
        bboxStartX: pos.x,
        bboxStartY: pos.y,
        value: prevState.labeller_state.value,
        bboxes: prevState.labeller_state.bboxes,
        classnames: prevState.labeller_state.classnames,
        pathIndex: prevState.labeller_state.pathIndex,
        userName: prevState.labeller_state.userName,
        wholeImageLabel: prevState.labeller_state.wholeImageLabel
      },
      config_state: prevState.config_state
    }));
  }

  getFileListForFolder(folderPath) {
    console.log("Getting file path...");
    console.log(folderPath);
    return superagent
      .get(process.env.REACT_APP_BACKEND_URI + "/filelist?q=" + folderPath)
      .end((err, res) => {
        console.log(res.body);
        this.setState(prevState => ({
          labeller_state: prevState.labeller_state,
          config_state: {
            dataSetName: prevState.config_state.dataSetName,
            dataSetFolder: prevState.config_state.dataSetFolder,
            randomizeOrder: prevState.config_state.randomizeOrder,
            fileList: res.body.fileList,
            fullFileList: res.body.fileList
          }
        }));
      });
  }

  // This is for review mode - returns all the images from the dataset which
  // have already been labelled with this classname - a subset of fullFileList
  updateFileListForReview() {
    if (this.state.reviewClass) {
      return superagent
        .get(process.env.REACT_APP_BACKEND_URI + "/labelledPathList")
        .query({
          dataSetName: this.state.config_state.dataSetName,
          wholeImageLabel: this.state.reviewClass
        })
        .end((err, res) => {
          console.log(res.body);
          var fList = [];
          res.body.labelledPathList.forEach(function(element) {
            fList.push(element.path);
          });

          this.setState(prevState => ({
            config_state: { ...prevState.config_state, fileList: fList },
            labeller_state: { ...prevState.labeller_state, pathIndex: 0 }
          }));
          // Second get
          superagent
            .get(process.env.REACT_APP_BACKEND_URI + "/labellerExistingImage")
            .query({
              dataSetName: this.state.config_state.dataSetName,
              dataSetFolder: this.state.config_state.dataSetFolder,
              path: this.state.config_state.fileList[0]
            })
            .end((err, res) => {
              var unscaled_bboxes = [];
              var wholeImageLabel = null;
              if (res.body.metaData) {
                unscaled_bboxes = this.getUnscaledBboxes(
                  res.body.metaData.bboxes
                );
                if (res.body.metaData.wholeImageLabel) {
                  wholeImageLabel = res.body.metaData.wholeImageLabel;
                }
              }

              this.setState(prevState => ({
                labeller_state: {
                  ...prevState.labeller_state,
                  bboxes: unscaled_bboxes,
                  mouseIsDown: false,
                  bboxStartX: null,
                  bboxStartY: null,
                  wholeImageLabel: wholeImageLabel,
                  pathIndex: 0
                }
              }));
            });
        });
    }
  }

  getConfigList() {
    console.log("Getting configList...");
    superagent
      .get(process.env.REACT_APP_BACKEND_URI + "/configlist")
      .end((err, res) => {
        console.log(res.body);
        this.setState(prevState => ({
          labeller_state: {
            mouseIsDown: false,
            bboxStartX: null,
            bboxStartY: null,
            bboxes: Array(0),
            classnames: prevState.classnames,
            value: prevState.value,
            pathIndex: prevState.labeller_state.pathIndex
          },
          config_list: res.body.configList
        }));
      });
  }

  handleConfigChoose(config) {
    const newClassNames = [];
    for (var i = 0; i < config.classnames.length; i++) {
      newClassNames.push(config.classnames[i].textValue);
    }
    console.log("handleConfigChoose");
    console.log(config);

    superagent
      .get(process.env.REACT_APP_BACKEND_URI + "/labellerExistingImage")
      .query({
        dataSetName: config.dataSetName,
        dataSetFolder: config.dataSetFolder,
        path: config.fileList[0]
      })
      .end((err, res) => {
        var unscaled_bboxes = [];
        var wholeImageLabel = null;
        if (res.body.metaData) {
          unscaled_bboxes = this.getUnscaledBboxes(res.body.metaData.bboxes);
          if (res.body.metaData.wholeImageLabel) {
            wholeImageLabel = res.body.metaData.wholeImageLabel;
          }
        }
        this.setState(prevState => ({
          labeller_state: {
            mouseIsDown: false,
            bboxStartX: null,
            bboxStartY: null,
            bboxes: unscaled_bboxes,
            wholeImageLabel: wholeImageLabel,
            classnames: newClassNames,
            value: config.classnames[0].textValue,
            pathIndex: 0,
            userName: config.userName
          },
          config_state: {
            dataSetName: config.dataSetName,
            dataSetFolder: config.dataSetFolder,
            randomizeOrder: config.randomizeOrder,
            wholeImageLabels: config.wholeImageLabels,
            fileList: config.fileList,
            fullFileList: config.fileList,
            classnames: config.classnames
          },
          showBboxSvg: true,
          showFullConfigForm: false
        }));
      });
  }

  handleConfigSave(newConfig) {
    const newClassNames = [];
    for (var i = 0; i < newConfig.classnames.length; i++) {
      newClassNames.push(newConfig.classnames[i].textValue);
    }
    this.setState(prevState => ({
      labeller_state: {
        mouseIsDown: false,
        bboxStartX: null,
        bboxStartY: null,
        bboxes: [],
        classnames: newClassNames,
        value: newConfig.classnames[0].textValue,
        pathIndex: 0,
        userName: newConfig.userName
      },
      config_state: {
        dataSetName: newConfig.dataSetName,
        dataSetFolder: newConfig.dataSetFolder,
        randomizeOrder: newConfig.randomizeOrder,
        wholeImageLabels: newConfig.wholeImageLabels,
        fileList: [],
        recursiveFlag: newConfig.recursiveFlag,
        findJpeg: newConfig.findJpeg,
        findPng: newConfig.findPng
      }
    }));
    return superagent
      .get(process.env.REACT_APP_BACKEND_URI + "/filelist?")
      .query({
        dataSetFolder:
          process.env.REACT_APP_HOST_DATA_PREFIX + newConfig.dataSetFolder,
        recursiveFlag: newConfig.recursiveFlag,
        randomizeOrder: newConfig.randomizeOrder,
        findJpeg: newConfig.findJpeg,
        findPng: newConfig.findPng
      })
      .end((err, res) => {
        this.setState(prevState => ({
          labeller_state: prevState.labeller_state,
          config_state: {
            dataSetName: newConfig.dataSetName,
            dataSetFolder: newConfig.dataSetFolder,
            wholeImageLabels: newConfig.wholeImageLabels,
            randomizeOrder: newConfig.randomizeOrder,
            fileList: res.body.fileList,
            recursiveFlag: newConfig.recursiveFlag,
            findJpeg: newConfig.findJpeg,
            findPng: newConfig.findJpeg
          }
        }));

        // Second get
        superagent
          .get(process.env.REACT_APP_BACKEND_URI + "/labellerExistingImage")
          .query({
            dataSetName: newConfig.dataSetName,
            dataSetFolder: newConfig.dataSetFolder,
            path: this.state.config_state.fileList[0]
          })
          .end((err, res) => {
            var unscaled_bboxes;
            if (res.body.metaData) {
              unscaled_bboxes = this.getUnscaledBboxes(
                res.body.metaData.bboxes
              );
            } else {
              unscaled_bboxes = [];
            }
            this.setState(prevState => ({
              labeller_state: {
                mouseIsDown: false,
                bboxStartX: null,
                bboxStartY: null,
                bboxes: unscaled_bboxes,
                wholeImageLabel: null,
                classnames: newClassNames,
                value: newConfig.classnames[0].textValue,
                pathIndex: 0,
                userName: newConfig.userName
              },
              config_state: prevState.config_state,
              showBboxSvg: true,
              showFullConfigForm: false
            }));
            // The last post
            superagent
              .post(process.env.REACT_APP_BACKEND_URI + "/configSubmit")
              .send({
                config_state: {
                  dataSetName: newConfig.dataSetName,
                  dataSetFolder: newConfig.dataSetFolder,
                  wholeImageLabels: newConfig.wholeImageLabels,
                  randomizeOrder: newConfig.randomizeOrder,
                  fileList: this.state.config_state.fileList,
                  classnames: newClassNames,
                  recursiveFlag: newConfig.recursiveFlag,
                  findJpeg: newConfig.findJpeg,
                  findPng: newConfig.findJpeg
                }
              })
              .end((err, res) => {
                if (err) {
                  console.log("Config save error");
                } else {
                  console.log("Config save success");
                }
              });
          });
      });
  }

  getScaledBboxes() {
    let scaledBboxes = [];
    for (var i = 0; i < this.state.labeller_state.bboxes.length; i++) {
      let bbox = this.state.labeller_state.bboxes[i];
      let scaledBbox = {
        id: bbox.id,
        classname: bbox.classname,
        x: bbox.x * bbox.widthScaleFactor,
        y: bbox.y * bbox.heightScaleFactor,
        width: bbox.width * bbox.widthScaleFactor,
        height: bbox.height * bbox.heightScaleFactor,
        widthScaleFactor: bbox.widthScaleFactor,
        heightScaleFactor: bbox.heightScaleFactor
      };
      scaledBboxes.push(scaledBbox);
    }

    return scaledBboxes;
  }

  getUnscaledBboxes(bboxes) {
    let unscaledBboxes = [];
    for (var i = 0; i < bboxes.length; i++) {
      let bbox = bboxes[i];
      let scaledBbox = {
        id: bbox.id,
        classname: bbox.classname,
        x: bbox.x / bbox.widthScaleFactor,
        y: bbox.y / bbox.heightScaleFactor,
        width: bbox.width / bbox.widthScaleFactor,
        height: bbox.height / bbox.heightScaleFactor,
        widthScaleFactor: bbox.widthScaleFactor,
        heightScaleFactor: bbox.heightScaleFactor
      };
      unscaledBboxes.push(scaledBbox);
    }

    return unscaledBboxes;
  }

  skipToFirstUnlabelled() {
    var dataSetName = this.state.config_state.dataSetName;
    var pathList = this.state.config_state.fileList;
    superagent
      .get(process.env.REACT_APP_BACKEND_URI + "/labelledPathList")
      .query({ dataSetName: dataSetName })
      .end((err, res) => {
        console.log(res);
        var labelledPaths = [];
        for (var j = 0; j < res.body.labelledPathList.length; j++) {
          labelledPaths.push(res.body.labelledPathList[j].path);
        }
        // Get index of first path which is not in
        // the list of labelled ones
        var first_unlabelled_index = 0;
        for (var i = 0; i < pathList.length; i++) {
          if (!labelledPaths.includes(pathList[i])) {
            first_unlabelled_index = i;
            break;
          }
        }

        if (i > first_unlabelled_index) {
          // all images have been labelled
          first_unlabelled_index = pathList.length;
        }
        console.log(first_unlabelled_index);
        this.setState(prevState => ({
          labeller_state: {
            mouseIsDown: false,
            bboxStartX: null,
            bboxStartY: null,
            bboxes: [],
            wholeImageLabel: null,
            classnames: prevState.labeller_state.classnames,
            value: prevState.labeller_state.value,
            pathIndex: first_unlabelled_index,
            userName: prevState.labeller_state.userName
          }
        }));
      });
  }

  handleSubmitStep() {
    if (
      this.state.labeller_state.pathIndex <
      this.state.config_state.fileList.length - 1
    ) {
      const scaledLabellerState = {
        path: this.state.labeller_state.path,
        bboxes: this.getScaledBboxes(),
        wholeImageLabel: this.state.labeller_state.wholeImageLabel,
        pathIndex: this.state.labeller_state.pathIndex,
        userName: this.state.labeller_state.userName
      };

      return superagent
        .post(process.env.REACT_APP_BACKEND_URI + "/labellerSubmit")
        .send({
          labeller_state: scaledLabellerState,
          config_state: this.state.config_state
        })
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            console.log(res);
            superagent
              .get(process.env.REACT_APP_BACKEND_URI + "/labellerExistingImage")
              .query({
                dataSetName: this.state.config_state.dataSetName,
                dataSetFolder: this.state.config_state.dataSetFolder,
                path: this.state.config_state.fileList[
                  this.state.labeller_state.pathIndex + 1
                ]
              })
              .end((err, res) => {
                var unscaled_bboxes = [];
                var wholeImageLabel = null;
                if (res.body.metaData) {
                  unscaled_bboxes = this.getUnscaledBboxes(
                    res.body.metaData.bboxes
                  );
                  if (res.body.metaData.wholeImageLabel) {
                    wholeImageLabel = res.body.metaData.wholeImageLabel;
                  }
                }
                this.setState(prevState => ({
                  labeller_state: {
                    mouseIsDown: false,
                    bboxStartX: null,
                    bboxStartY: null,
                    bboxes: unscaled_bboxes,
                    wholeImageLabel: wholeImageLabel,
                    classnames: prevState.labeller_state.classnames,
                    value: prevState.labeller_state.value,
                    pathIndex: prevState.labeller_state.pathIndex + 1,
                    userName: prevState.labeller_state.userName
                  },
                  config_state: prevState.config_state
                }));
              });
          }
        });
    }
  }

  handleSubmitBackStep() {
    if (this.state.labeller_state.pathIndex > 0) {
      return superagent
        .get(process.env.REACT_APP_BACKEND_URI + "/labellerExistingImage")
        .query({
          dataSetName: this.state.config_state.dataSetName,
          dataSetFolder: this.state.config_state.dataSetFolder,
          path: this.state.config_state.fileList[
            this.state.labeller_state.pathIndex - 1
          ]
        })
        .end((err, res) => {
          var unscaled_bboxes;
          if (res.body.metaData) {
            unscaled_bboxes = this.getUnscaledBboxes(res.body.metaData.bboxes);
          } else {
            unscaled_bboxes = [];
          }
          this.setState(prevState => ({
            labeller_state: {
              mouseIsDown: false,
              bboxStartX: null,
              bboxStartY: null,
              bboxes: unscaled_bboxes,
              wholeImageLabel: res.body.metaData.wholeImageLabel,
              classnames: prevState.labeller_state.classnames,
              value: prevState.labeller_state.value,
              pathIndex: prevState.labeller_state.pathIndex - 1,
              userName: prevState.labeller_state.userName
            },
            config_state: prevState.config_state
          }));
        });
    }
  }

  render() {
    const path =
      process.env.REACT_APP_IMAGE_SERVER_URI +
      this.state.config_state.dataSetFolder +
      "/" +
      this.state.config_state.fileList[this.state.labeller_state.pathIndex];
    return (
      <React.Fragment>
        <CssBaseline />
        <MuiThemeProvider theme={muiTheme}>
          <Paper width={400}>
            <div className="mainChunk">
              <div>
                <AppBar position="static">
                  <Toolbar disableGutters={true}>
                    <IconButton color="inherit" aria-label="Menu">
                      <ThumbIcon />
                    </IconButton>
                    <Typography variant="title" color="inherit">
                      Objectivity : Data Annotator
                    </Typography>
                  </Toolbar>
                </AppBar>
              </div>

              <div className="rowContainer">
                <div>
                  <ConfigForm
                    config_list={this.state.config_list}
                    showFullConfigForm={this.state.showFullConfigForm}
                    handleConfigSave={this.handleConfigSave.bind(this)}
                    handleConfigChoose={this.handleConfigChoose.bind(this)}
                    toggleShowFullConfigForm={this.toggleShowFullConfigForm.bind(
                      this
                    )}
                  />
                </div>

                <div>
                  <BBOXSvg
                    path={path}
                    svg_width={SVG_WIDTH}
                    svg_height={SVG_HEIGHT}
                    img_width={1}
                    img_height={1}
                    labeller_state={this.state.labeller_state}
                    config_state={this.state.config_state}
                    reviewModeOn={this.state.reviewModeOn}
                    reviewClass={this.state.reviewClass}
                    handleSubmitStep={this.handleSubmitStep.bind(this)}
                    handleSubmitBackStep={this.handleSubmitBackStep.bind(this)}
                    handleClassButtonChange={this.handleClassButtonChange.bind(
                      this
                    )}
                    labellerMouseDown={this.labellerMouseDown.bind(this)}
                    addBbox={this.addBbox.bind(this)}
                    deleteBbox={this.deleteBbox.bind(this)}
                    deleteWholeImageLabel={this.deleteWholeImageLabel.bind(
                      this
                    )}
                    showBboxSvg={this.state.showBboxSvg}
                    skipToFirstUnlabelled={this.skipToFirstUnlabelled.bind(
                      this
                    )}
                    toggleReviewModeOn={this.toggleReviewModeOn.bind(this)}
                    handleReviewClassSelect={this.handleReviewClassSelect.bind(
                      this
                    )}
                    updateFileListForReview={this.updateFileListForReview.bind(
                      this
                    )}
                    handleClassButtonChangeByIndex={this.handleClassButtonChangeByIndex.bind(
                      this
                    )}
                  />
                </div>
              </div>
            </div>
          </Paper>
        </MuiThemeProvider>
      </React.Fragment>
    );
  }
}
//<HotKeys keyMap={keyMap} handlers={handlers}>
//          </HotKeys>
export default App;

import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import MobileStepper from "@material-ui/core/MobileStepper";
import Button from "@material-ui/core/Button";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

const styles = {
  root: {
    maxWidth: 700,
    flexGrow: 2
  }
};

class SubmitStepper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeStep: props.labeller_state.pathIndex
    };
  }

  handleNext = () => {
    this.props.handleSubmitStep();
  };

  handleBack = () => {
    this.props.handleSubmitBackStep();
  };

  render() {
    const { classes, theme } = this.props;
    const numSteps = this.props.config_state.fileList.length;

    return (
      <MobileStepper
        variant="progress"
        steps={numSteps}
        position="static"
        activeStep={this.props.labeller_state.pathIndex}
        className={classes.root}
        nextButton={
          <Button
            size="small"
            onClick={this.handleNext}
            disabled={this.props.labeller_state.pathIndex === numSteps}
          >
            Submit
            {theme.direction === "rtl" ? (
              <KeyboardArrowLeft />
            ) : (
              <KeyboardArrowRight />
            )}
          </Button>
        }
        backButton={
          <Button
            size="small"
            onClick={this.handleBack}
            disabled={this.props.labeller_state.pathIndex === 0}
          >
            {theme.direction === "rtl" ? (
              <KeyboardArrowRight />
            ) : (
              <KeyboardArrowLeft />
            )}
            Back
          </Button>
        }
      />
    );
  }
}

SubmitStepper.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(SubmitStepper);

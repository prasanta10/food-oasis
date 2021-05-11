import React, { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Button, CircularProgress, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import List from "react-virtualized/dist/es/List";
import AutoSizer from "react-virtualized/dist/es/AutoSizer";
import CellMeasurer from "react-virtualized/dist/es/CellMeasurer";
import CellMeasurerCache from "react-virtualized/dist/es/CellMeasurer/CellMeasurerCache";
import StakeholderPreview from "components/FoodSeeker/StakeholderPreview";
import StakeholderDetails from "components/FoodSeeker/StakeholderDetails";
import * as analytics from "services/analytics";

const useStyles = makeStyles((theme) => ({
  listContainer: {
    textAlign: "center",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    [theme.breakpoints.up("md")]: {
      height: "100%",
    },
    [theme.breakpoints.only("sm")]: {
      order: 1,
      height: "30em",
    },
    [theme.breakpoints.down("xs")]: {
      height: "100%",
      fontSize: "12px",
    },
  },
  list: {
    width: "100%",
    flex: 1,
  },
  preview: {
    width: "100%",
    borderBottom: " .2em solid #f1f1f1",
    padding: "0 1em",
  },
  emptyResult: {
    padding: "1em 0",
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
  },
}));

const cache = new CellMeasurerCache({
  defaultHeight: 140,
  fixedWidth: true,
});

const clearCache = () => cache.clearAll();

const ResultsList = ({
  doSelectStakeholder,
  selectedStakeholder,
  stakeholders,
  setToast,
  status,
  handleReset,
}) => {
  const classes = useStyles();

  useEffect(() => {
    analytics.postEvent("showList");
  }, []);

  useEffect(() => {
    window.addEventListener("resize", clearCache);
    return () => window.removeEventListener("resize", clearCache);
  }, []);

  useEffect(() => {
    clearCache();
  }, [stakeholders]);

  const scrollToIndex = selectedStakeholder
    ? stakeholders.findIndex((s) => s.id === selectedStakeholder.id)
    : 0;

  const rowRenderer = useCallback(
    ({ index, style, key, parent }) => (
      <CellMeasurer
        key={key}
        cache={cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        {({ registerChild }) => (
          <div ref={registerChild} style={style} className={classes.preview}>
            <StakeholderPreview
              stakeholder={stakeholders[index]}
              doSelectStakeholder={doSelectStakeholder}
            />
          </div>
        )}
      </CellMeasurer>
    ),
    [stakeholders, doSelectStakeholder, classes.preview]
  );

  return (
    <Grid item xs={12} md={4} className={classes.listContainer}>
      {status === "loading" && (
        <div className={classes.emptyResult}>
          <CircularProgress />
        </div>
      )}
      {status === "loaded" && stakeholders.length === 0 && (
        <div className={classes.emptyResult}>
          <p>Sorry, we don&apos;t have any results for this area.</p>
          <Button
            onClick={handleReset}
            variant="contained"
            color="primary"
            disableElevation
          >
            Click here to reset the search
          </Button>
        </div>
      )}
      {stakeholders && selectedStakeholder && !selectedStakeholder.inactive ? (
        <StakeholderDetails
          doSelectStakeholder={doSelectStakeholder}
          selectedStakeholder={selectedStakeholder}
          setToast={setToast}
        />
      ) : (
        <div className={classes.list}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
                rowCount={stakeholders.length}
                rowRenderer={rowRenderer}
                deferredMeasurementCache={cache}
                rowHeight={cache.rowHeight}
                scrollToIndex={scrollToIndex}
              />
            )}
          </AutoSizer>
        </div>
      )}
    </Grid>
  );
};

ResultsList.propTypes = {
  selectedStakeholder: PropTypes.object,
  stakeholders: PropTypes.arrayOf(PropTypes.object),
  doSelectStakeholder: PropTypes.func,
  setToast: PropTypes.func,
  status: PropTypes.string,
  handleReset: PropTypes.func,
};

export default ResultsList;
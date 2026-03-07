import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {},
  wingoRoot: {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    overflowX: "hidden",
    paddingLeft: "max(12px, env(safe-area-inset-left))",
    paddingRight: "max(12px, env(safe-area-inset-right))",
    boxSizing: "border-box",
    minHeight: "100vh",
  },
  header: {
    backgroundColor: "#0d9488",
    paddingTop: "max(12px, env(safe-area-inset-top))",
    paddingBottom: 12,
    paddingLeft: "max(16px, env(safe-area-inset-left))",
    paddingRight: "max(16px, env(safe-area-inset-right))",
  },
  wingoSection: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 16,
    [theme.breakpoints.up("sm")]: {
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 20,
    },
  },
  numberCircle: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
  },
  drawerFooter: {
    paddingBottom: "max(8px, env(safe-area-inset-bottom))",
  },
  bottomSpacer: {
    paddingBottom: "max(80px, calc(80px + env(safe-area-inset-bottom)))",
  },
  myTask: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
  },
  headerMines: {},
  gridList: {},
  headerAviator: {},
  headerAviatorOn: {},
  planeImg: {},
  headerCricketPage: {},
  headerBigSmall: {},
  headerFastParity: {},
  headerOdds: {},
  headerCricketPitch: {},
}));

export default useStyles;

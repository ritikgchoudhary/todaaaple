import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  ErrorPage: {
    paddingTop: '150px',
  },
  phoneIcon: {
    paddingBottom: "15px",
  },
  passIcon: {
    paddingBottom: "15px",
  },
  container: {
    paddingTop: "100px",
  },
  fieldMargin: {
    margin: theme.spacing(1),
  },
  form: {
    paddingTop: '50px'
 },
 button: {
    marginTop: '50px'
 },
 heading: {
   fontSize: '22px',
   fontWeight: 'bold',
   textTransform: 'none',
 }
}));
export default useStyles;
import React from 'react';
import { Switch, Route, useLocation, Redirect } from "react-router-dom";
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Components
import AuthForm from "./components/auth/authForm";
import Forget from "./components/auth/forget";

// Layout Components
import NavBar from "./components/nav";

// Game Components
import Home from "./components/home/home";
import MinutesGamePage from './components/minute/game.jsx';
import GamePlayer from './components/home/GamePlayer.jsx';
import LuckySportsPage from './components/sports/LuckySportsPage';

// History Component
import MinutesFullRecord from './components/minute/Minutes_fullRecord.js';
import MinutesFullBidHistory from './components/minute/Minutes_fullBid.js';
import WinStreakProgress from './components/minute/WinStreakProgress.jsx';

// Profile Components
import Profile from "./components/profile/profile";
import ApiDocs from "./components/profile/ApiDocs";
import About from "./components/profile/about/about";
import PrivacyPolicy from "./components/profile/about/privacy";
import Risk from "./components/profile/about/risk";
import AppStatement from "./components/profile/about/appStatement";
import MyTask from "./components/profile/about/mytask";
import Refund from "./components/profile/about/refund";
import AboutUs from "./components/profile/about/aboutus";
import Contact from './components/profile/about/contact';
import Help from './components/profile/support.js';

// Wallet Components
import MyWallet from './components/profile/wallet/mywallet';
import PreOrder from './components/profile/wallet/recharge';
import Withdrawal from './components/profile/wallet/withdrawal';
import WithdrawalHistory from './components/profile/wallet/withdrawalHistory';
import RechargeHistory from './components/profile/wallet/history.js';
import MySalary from './components/profile/wallet/mySalary.js';
import AgentEarning from './components/profile/wallet/agentEarning.jsx';
import MyDailyTask from './components/profile/wallet/dailyTask.js';
import InvitationBonus from './components/profile/wallet/invitationBonus.jsx';
import InvitationRecord from './components/profile/wallet/invitationRecord.jsx';
import InvitationRule from './components/profile/wallet/invitationRule.jsx';
import OfferHistory from './components/profile/wallet/offerHistory.jsx';

// Other Components
import MyRedEnvelop from "./components/profile/wallet/redEnvelop";
import Envelope from "./components/profile/envelop";
import AccountSecurity from "./components/profile/accSeq/accSeq";
import ModifyName from "./components/profile/accSeq/name";
import ModifyPassword from "./components/profile/accSeq/pass";
import ModifyPayment from "./components/profile/accSeq/payment";
import Financial from "./components/profile/financial";
import MyPromotion from "./components/profile/promotion";
import Invite from "./components/profile/invite";
import PromotionRecord from "./components/profile/promRecord";
import ApplyRecord from "./components/profile/applyRec";
import MyBank from "./components/profile/bank";
import MyAddress from "./components/profile/address";
import ApplyPromotion from "./components/profile/appPromotion";
import Terms from "./components/profile/terms";
import RedEnvelopHistory from './components/profile/wallet/redEnvelopHistory';
import PromotionRecordNew from './components/profile/promRecordNew';
import NewGamePage from './components/minute/game/game1.jsx';
import PlaceOrder3 from './components/profile/wallet/placeOrder3.0.jsx';
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import WithdrawalManagement from "./components/admin/WithdrawalManagement";
import CommissionManagement from "./components/admin/CommissionManagement";
import ProviderManagement from "./components/admin/ProviderManagement";
import GameManagement from "./components/admin/GameManagement";
import CategoryManagement from "./components/admin/CategoryManagement";
import RechargeSettings from "./components/admin/RechargeSettings";
import CarouselManagement from "./components/admin/CarouselManagement";
import SiteSettings from "./components/admin/SiteSettings";
import SlotsJsonEditor from "./components/admin/SlotsJsonEditor";


const App = () => {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
    shape: {
      borderRadius: 0,
    },
    spacing: 5,
    typography: {
      fontSize: 12,
      body1: { fontSize: '0.8125rem' },
      body2: { fontSize: '0.75rem' },
      subtitle1: { fontSize: '0.8125rem' },
      subtitle2: { fontSize: '0.75rem' },
      caption: { fontSize: '0.6875rem' },
      button: { fontSize: '0.75rem' },
      h1: { fontSize: '1.5rem' },
      h2: { fontSize: '1.25rem' },
      h3: { fontSize: '1.125rem' },
      h4: { fontSize: '1rem' },
      h5: { fontSize: '0.9375rem' },
      h6: { fontSize: '0.875rem' },
    },
    zIndex: {
      modal: 10001,
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          '*': {
            borderRadius: '6px !important',
          },
        },
      },
      MuiPaper: { rounded: { borderRadius: 6 } },
      MuiButton: { root: { borderRadius: 6 } },
      MuiCard: { root: { borderRadius: 6 } },
      MuiChip: { root: { borderRadius: 6 } },
      MuiDialog: {
        paper: { borderRadius: 6 },
        scrollPaper: {
          '@media (max-width: 600px)': {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            paddingBottom: 80,
            overflowY: 'auto',
          },
        },
        paperScrollPaper: {
          '@media (max-width: 600px)': {
            margin: 0,
            flexShrink: 0,
            maxHeight: 'calc(100vh - 100px)',
          },
        },
      },
      MuiBottomNavigation: { root: { borderRadius: 0 } },
      MuiBottomNavigationAction: {
        root: {
          borderRadius: 0,
          outline: 'none',
          textDecoration: 'none',
          border: 'none',
          borderBottom: 'none',
          boxShadow: 'none',
          '&::before': { display: 'none' },
          '&::after': { display: 'none' },
          '&:hover': {
            backgroundColor: 'transparent',
            textDecoration: 'none',
            border: 'none',
            borderBottom: 'none',
            boxShadow: 'none',
          },
          '&:focus': {
            outline: 'none',
            textDecoration: 'none',
            border: 'none',
            borderBottom: 'none',
          },
          '&:focus-visible': { outline: 'none' },
        },
        label: {
          textDecoration: 'none',
          '&:hover': { textDecoration: 'none' },
        },
        wrapper: {
          textDecoration: 'none',
        },
      },
      MuiOutlinedInput: { root: { borderRadius: 6 } },
      MuiFilledInput: { root: { borderRadius: 6 } },
    },
  });

  const location = useLocation();
  const hideNavBarPaths = ["/login", "/resetPassword", "/admin", "/master-admin", "/play"];
  const shouldHideNavBar = hideNavBarPaths.some(path => location.pathname.startsWith(path));

  return (

    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div style={{ minHeight: "100vh" }}>
      <Switch>
        {/* Admin Routes */}
        <Route exact path="/admin">
          <Redirect to="/admin/dashboard" />
        </Route>
        <Route exact path="/admin/dashboard" component={AdminDashboard} />
        <Route exact path="/admin/users" component={UserManagement} />
        <Route exact path="/admin/withdrawals" component={WithdrawalManagement} />
        <Route exact path="/admin/commissions" component={CommissionManagement} />
        <Route exact path="/admin/providers" component={ProviderManagement} />
        <Route exact path="/admin/games" component={GameManagement} />
        <Route exact path="/admin/categories" component={CategoryManagement} />
        <Route exact path="/admin/recharge-settings" component={RechargeSettings} />
        <Route exact path="/admin/carousel" component={CarouselManagement} />
        <Route exact path="/admin/site-settings" component={SiteSettings} />
        <Route exact path="/admin/slots" component={SlotsJsonEditor} />

        {/* Public Routes */}
        <Route exact path="/login/:id" component={AuthForm} />
        <Route exact path="/login" component={AuthForm} />
        <Route exact path="/resetPassword" component={Forget} />
        <Route exact path="/about-us" component={About} />
        <Route exact path="/shipping-policy" component={PrivacyPolicy} />



        {/* Protected Routes */}
        <ProtectedRoute exact path="/" component={Home} />
        <ProtectedRoute exact path="/sports" component={LuckySportsPage} />

        {/* Game Routes */}
        <ProtectedRoute path="/wingo/:id" component={NewGamePage} />
        {/* <ProtectedRoute exact path="/game" component={GamePage} />
            <ProtectedRoute exact path="/mines" component={MinesGamePage} />
            <ProtectedRoute exact path="/fastParity" component={FastParityGamePage} />
            <ProtectedRoute exact path="/bigsmall" component={BigSmallGamePage} />
            <ProtectedRoute exact path="/aviator" component={AviatorGamePage} />
            <ProtectedRoute exact path="/cricket" component={CricketGamePage} />
            <ProtectedRoute exact path="/cricket/match/:id" component={MatchPage} /> */}

        {/* History Routes */}
        {/* <ProtectedRoute exact path="/bidHistory/:game" component={FullBidHistory} />
            <ProtectedRoute exact path="/fastParity/bidHistory" component={FastParityFullBidHistory} />
            <ProtectedRoute exact path="/bigsmall/bidHistory" component={BigSmallFullBidHistory} /> */}
        <ProtectedRoute exact path="/minutes/bidHistory/:id" component={MinutesFullBidHistory} />
        <ProtectedRoute exact path="/winstreak/:id" component={WinStreakProgress} />
        {/* <ProtectedRoute exact path="/mines/playHistory" component={FullMinesBidHistory} /> */}
        <ProtectedRoute exact path="/minutes/record/:id" component={MinutesFullRecord} />
        {/* <ProtectedRoute exact path="/fastParity/record" component={FastParityFullRecord} />
            <ProtectedRoute exact path="/bigsmall/record" component={BigSmallFullRecord} />
            <ProtectedRoute exact path="/aviator/history" component={AviatorFullBidHistory} />
            <ProtectedRoute exact path="/aviator/record" component={AviatorFullRecord} />
            <ProtectedRoute exact path="/cricket/history" component={CricketFullBidHistory} /> */}

        {/* Profile Routes */}
        <ProtectedRoute exact path="/profile" component={Profile} />
        <ProtectedRoute exact path="/api-docs" component={ApiDocs} />
        <ProtectedRoute exact path="/help" component={Help} />
        <ProtectedRoute exact path="/contact" component={Contact} />
        <ProtectedRoute exact path="/play" component={GamePlayer} />

        {/* Wallet Routes */}
        <ProtectedRoute exact path="/wallet" component={MyWallet} />
        <ProtectedRoute exact path="/withdrawal" component={Withdrawal} />
        <ProtectedRoute exact path="/recharge" component={PreOrder} />
        <ProtectedRoute exact path="/preOrder" component={PreOrder} />
        <ProtectedRoute exact path="/placeOrder3/:id/:token" component={PlaceOrder3} />
        <ProtectedRoute exact path="/rechargeHistory" component={RechargeHistory} />
        <ProtectedRoute exact path="/withdrawalHistory" component={WithdrawalHistory} />
        <ProtectedRoute exact path="/mySalary" component={MySalary} />
        <ProtectedRoute exact path="/agent-earning" component={AgentEarning} />
        <ProtectedRoute exact path="/dailyTask" component={MyDailyTask} />
        <ProtectedRoute exact path="/invitationBonus" component={InvitationBonus} />
        <ProtectedRoute exact path="/invitationRewardRule" component={InvitationRule} />
        <ProtectedRoute exact path="/invitationRecord" component={InvitationRecord} />
        <ProtectedRoute exact path="/offer-history" component={OfferHistory} />

        {/* Other Protected Routes */}
        <ProtectedRoute exact path="/myTask" component={MyTask} />
        <ProtectedRoute exact path="/applyRecord" component={ApplyRecord} />
        <ProtectedRoute exact path="/invite" component={Invite} />
        <ProtectedRoute exact path="/redenvelope" component={MyRedEnvelop} />
        <ProtectedRoute exact path="/redEnvelopeHistory" component={RedEnvelopHistory} />
        <ProtectedRoute exact path="/financial" component={Financial} />
        <ProtectedRoute exact path="/bank" component={MyBank} />
        <ProtectedRoute exact path="/accountSecurity" component={AccountSecurity} />
        <ProtectedRoute exact path="/accountSecurity/name" component={ModifyName} />
        <ProtectedRoute exact path="/accountSecurity/password" component={ModifyPassword} />
        <ProtectedRoute exact path="/accountSecurityhttps://pay.toddapple.live/placeOrder3" component={ModifyPayment} />
        <ProtectedRoute exact path="/discount" component={MyPromotion} />
        <ProtectedRoute exact path="/mypromotion" component={MyPromotion} />
        <ProtectedRoute exact path="/mypromotion/apply" component={ApplyPromotion} />
        <ProtectedRoute exact path="/address" component={MyAddress} />
        <ProtectedRoute exact path="/promotionRecord/:id" component={PromotionRecord} />
        <ProtectedRoute exact path="/promotionRecordNew/:id" component={PromotionRecordNew} />
        <ProtectedRoute exact path="/getRedEnvelop/:id" component={Envelope} />
      </Switch>
      </div>
      {!shouldHideNavBar && <NavBar />}
    </ThemeProvider>

  );
};

export default App;

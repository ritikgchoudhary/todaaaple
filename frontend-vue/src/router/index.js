import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import DepositView from '../views/DepositView.vue'
import AccountView from '../views/AccountView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'
import HelpView from '../views/HelpView.vue'
import WingoView from '../views/WingoView.vue'
import AgentEarningView from '../views/AgentEarningView.vue'
import MySalaryView from '../views/MySalaryView.vue'
import InvitationBonusView from '../views/InvitationBonusView.vue'
import OfferHistoryView from '../views/OfferHistoryView.vue'
import RedEnvelopeView from '../views/RedEnvelopeView.vue'
import RedEnvelopeHistoryView from '../views/RedEnvelopeHistoryView.vue'
import ReceiveEnvelopeView from '../views/ReceiveEnvelopeView.vue'
import WingoFullRecordView from '../views/WingoFullRecordView.vue'
import WingoFullHistoryView from '../views/WingoFullHistoryView.vue'
import MyPromotionView from '../views/MyPromotionView.vue'
import ApplyPromotionView from '../views/ApplyPromotionView.vue'
import ApplyRecordView from '../views/ApplyRecordView.vue'
import PromotionRecordView from '../views/PromotionRecordView.vue'
import PromotionRecordNewView from '../views/PromotionRecordNewView.vue'
import WalletView from '../views/WalletView.vue'
import BankView from '../views/BankView.vue'
import AccountSecurityView from '../views/AccountSecurityView.vue'
import AboutUsView from '../views/AboutUsView.vue'
import ApiDocsView from '../views/ApiDocsView.vue'
import WithdrawView from '../views/WithdrawView.vue'
import LuckySportsView from '../views/LuckySportsView.vue'
import WithdrawalHistoryView from '../views/WithdrawalHistoryView.vue'
import GameHistoryView from '../views/GameHistoryView.vue'
import DepositHistoryView from '../views/DepositHistoryView.vue'
import InviteView from '../views/InviteView.vue'
import InvitationRecordView from '../views/InvitationRecordView.vue'
import InvitationRewardRuleView from '../views/InvitationRewardRuleView.vue'
import MasterAdminView from '../views/MasterAdminView.vue'
import ModifyNameView from '../views/security/ModifyNameView.vue'
import ModifyPasswordView from '../views/security/ModifyPasswordView.vue'
import ModifyPaymentView from '../views/security/ModifyPaymentView.vue'
import AdminGamesTab from '../views/AdminGamesTab.vue'
import AdminSettingsTab from '../views/AdminSettingsTab.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/login/:id', name: 'LoginRefer', component: LoginView },
  { path: '/resetPassword', name: 'ResetPassword', component: ResetPasswordView },
  { path: '/', name: 'Home', component: HomeView, meta: { showNav: true } },
  { path: '/account', name: 'Account', component: AccountView, meta: { title: 'Account', requiresAuth: true, showNav: true } },
  { path: '/deposit', name: 'Deposit', component: DepositView, meta: { title: 'Deposit', requiresAuth: true, showNav: true } },
  { path: '/wingo/:id', name: 'Wingo', component: WingoView, meta: { title: 'Win Go', requiresAuth: true, showNav: true } },
  { path: '/bonus', redirect: '/wingo/1' },
  { path: '/agent-earning', name: 'AgentEarning', component: AgentEarningView, meta: { title: 'Agent Earning', requiresAuth: true, showNav: false } },
  { path: '/mySalary', name: 'MySalary', component: MySalaryView, meta: { title: 'My Daily Salary', requiresAuth: true, showNav: false } },
  { path: '/invitationBonus', name: 'InvitationBonus', component: InvitationBonusView, meta: { title: 'Invitation Bonus', requiresAuth: true, showNav: false } },
  { path: '/offer-history', name: 'OfferHistory', component: OfferHistoryView, meta: { title: 'Offer History', requiresAuth: true, showNav: false } },
  { path: '/redenvelope', name: 'RedEnvelope', component: RedEnvelopeView, meta: { title: 'Red Envelope', requiresAuth: true, showNav: false } },
  { path: '/redEnvelopeHistory', name: 'RedEnvelopeHistory', component: RedEnvelopeHistoryView, meta: { title: 'Red Envelope History', requiresAuth: true, showNav: false } },
  { path: '/getRedEnvelop/:id', name: 'ReceiveEnvelope', component: ReceiveEnvelopeView, meta: { title: 'Receive Envelope', requiresAuth: true, showNav: false } },
  { path: '/wingo-record/:id', name: 'WingoFullRecord', component: WingoFullRecordView, meta: { title: 'Record History', requiresAuth: true, showNav: false } },
  { path: '/wingo-history/:id', name: 'WingoFullHistory', component: WingoFullHistoryView, meta: { title: 'Bid History', requiresAuth: true, showNav: false } },
  { path: '/mypromotion', name: 'MyPromotion', component: MyPromotionView, meta: { title: 'My Promotion', requiresAuth: true, showNav: false } },
  { path: '/mypromotion/apply', name: 'ApplyPromotion', component: ApplyPromotionView, meta: { title: 'Apply Promotion', requiresAuth: true, showNav: false } },
  { path: '/applyRecord', name: 'ApplyRecord', component: ApplyRecordView, meta: { title: 'Apply Record', requiresAuth: true, showNav: false } },
  { path: '/promotionRecord/:id', name: 'PromotionRecord', component: PromotionRecordView, meta: { title: 'Promotion Record', requiresAuth: true, showNav: false } },
  { path: '/promotionRecordNew/:id', name: 'PromotionRecordNew', component: PromotionRecordNewView, meta: { title: 'Promotion Record New', requiresAuth: true, showNav: false } },
  { path: '/help', name: 'Help', component: HelpView, meta: { title: 'Help', showNav: true } },
  { path: '/wallet', name: 'Wallet', component: WalletView, meta: { title: 'Wallet', requiresAuth: true, showNav: true } },
  { path: '/bank', name: 'Bank', component: BankView, meta: { title: 'Bank', requiresAuth: true, showNav: false } },
  { path: '/accountSecurity', name: 'AccountSecurity', component: AccountSecurityView, meta: { title: 'Security', requiresAuth: true, showNav: false } },
  { path: '/accountSecurity/name', name: 'ModifyName', component: ModifyNameView, meta: { requiresAuth: true } },
  { path: '/accountSecurity/password', name: 'ModifyPassword', component: ModifyPasswordView, meta: { requiresAuth: true } },
  { path: '/accountSecurity/payment', name: 'ModifyPayment', component: ModifyPaymentView, meta: { requiresAuth: true } },
  { path: '/about-us', name: 'AboutUs', component: AboutUsView, meta: { title: 'About Us', showNav: true } },
  { path: '/api-docs', name: 'ApiDocs', component: ApiDocsView, meta: { title: 'API Docs', requiresAuth: true, showNav: false } },
  { path: '/withdrawal', name: 'Withdraw', component: WithdrawView, meta: { title: 'Withdraw', requiresAuth: true, showNav: true } },
  { path: '/lucky-sports', name: 'LuckySports', component: LuckySportsView, meta: { title: 'Sports', requiresAuth: true, showNav: true } },
  { path: '/withdrawalHistory', name: 'WithdrawalHistory', component: WithdrawalHistoryView, meta: { title: 'Withdrawal History', requiresAuth: true, showNav: false } },
  { path: '/gameHistory', name: 'GameHistory', component: GameHistoryView, meta: { title: 'Game History', requiresAuth: true, showNav: false } },
  { path: '/depositHistory', name: 'DepositHistory', component: DepositHistoryView, meta: { title: 'Deposit History', requiresAuth: true, showNav: false } },
  { path: '/invite', name: 'Invite', component: InviteView, meta: { title: 'Invite Friends', requiresAuth: true, showNav: false } },
  { path: '/invitationRecord', name: 'InvitationRecord', component: InvitationRecordView, meta: { title: 'Invitation Record', requiresAuth: true, showNav: false } },
  { path: '/invitationRewardRule', name: 'InvitationRewardRule', component: InvitationRewardRuleView, meta: { title: 'Invitation Rules', requiresAuth: true, showNav: false } },
  { 
    path: '/masteradmin', 
    component: MasterAdminView, 
    meta: { title: 'Master Admin Dashboard', requiresAuth: false, showNav: false },
    children: [
      { path: '', redirect: { name: 'MasterAdminGames' } },
      { path: 'games', name: 'MasterAdminGames', component: AdminGamesTab, meta: { tab: 'games' } },
      { path: 'settings', name: 'MasterAdminSettings', component: AdminSettingsTab, meta: { tab: 'settings' } }
    ]
  },
  { path: '/admin/games', name: 'AdminGames', component: () => import('../views/AdminGamesView.vue'), meta: { title: 'Master Admin - Games', requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router

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
  { path: '/help', name: 'Help', component: HelpView, meta: { title: 'Help', showNav: true } },
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

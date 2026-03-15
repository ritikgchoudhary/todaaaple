<template>
  <div class="rules-page">
    <div class="mobile-container">
      <header class="header">
        <div class="header-content">
          <router-link to="/invitationBonus" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </router-link>
          <h1 class="header-title">Invitation Rules</h1>
          <div class="header-placeholder"></div>
        </div>
      </header>

      <main class="content">
        <div class="rules-card shadow-premium">
          <div class="rule-section">
            <div class="rule-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <h3>How to Participate</h3>
            <p>Tell your friends about RushPay and share your unique referral link found on the Invite page.</p>
          </div>

          <div class="rule-section">
            <div class="rule-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3>Qualified Invitee</h3>
            <p>A friend is considered a "Qualified Invitee" once they register through your link and complete a single recharge of at least ₹300.</p>
          </div>

          <div class="rule-section">
            <div class="rule-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
            </div>
            <h3>Reward Tiers</h3>
            <p>You earn rewards as you reach specific milestones of qualified invitees. Check the Invitation Bonus dashboard to see your current progress and available rewards.</p>
          </div>

          <div class="rule-section note">
            <h3>Terms & Conditions</h3>
            <ul>
              <li>Multi-account registration by the same person is strictly prohibited.</li>
              <li>RushPay reserves the right to modify or cancel the referral program at any time.</li>
              <li>Rewards are typically processed instantly but may take up to 24 hours in some cases.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.rules-page {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  justify-content: center;
  font-family: var(--font-app);
}
.mobile-container { width: 100%; max-width: min(430px, 100vw); background: #fff; }
.header { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #f1f5f9; }
.header-content { height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
.back-link { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #64748b; text-decoration: none; }
.header-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.header-placeholder { width: 40px; }
.content { padding: 20px; }
.rules-card { background: #fff; border-radius: 20px; padding: 24px; border: 1px solid #f1f5f9; }
.rule-section { margin-bottom: 24px; }
.rule-icon { width: 44px; height: 44px; background: #f0fdfa; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.rule-section h3 { font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.rule-section p { font-size: 0.85rem; color: #64748b; line-height: 1.6; }
.note { background: #fff7ed; border-radius: 16px; padding: 16px; margin-top: 10px; }
.note h3 { color: #9a3412; }
.note ul { padding-left: 20px; list-style-type: disc; }
.note li { font-size: 0.8rem; color: #9a3412; margin-bottom: 4px; line-height: 1.4; }
.shadow-premium { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
</style>

<template>
  <div class="about-page">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">About Us</div>
      </header>

      <div class="content">
        <h2 class="sectionTitle">Company Introduction</h2>
        <p>
          THE GOOE is an online business that engages in full payment and pre-payment booking/unsubscription business according to the rules and conditions that we have established to regulate the business. We have tie-ups with some other reputed companies to provide best and satisfactory services to our clients/customers. Our company is one of the best among those that follow laws, and we have certain restrictions to prevent online fraud with our clients.
        </p>
        <p>
          Minors under the age of 18 are not permitted to participate in THE GOOE Advance Booking/unsubscribing.
        </p>
        <p>
          <strong>Note:</strong> Being a responsible trader, we advise our clients to read out our Privacy Statement, Risk Disclosure Agreement and Risk Agreement carefully to minimize their risk.
        </p>

        <h2 class="sectionTitle">Contact Us</h2>
        <p>
          <strong>After-sales Service E-mail:</strong><br />
          After-sales Service Hours: 10am-5pm from Monday to Friday.
          If you can’t get our reply, please wait patiently.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.about-page { min-height: 100vh; background-color: #F1F5F9; display: flex; justify-content: center; font-family: system-ui, -apple-system, sans-serif; }
.mobileContainer { width: 100%; max-width: 500px; min-height: 100vh; background-color: #fff; position: relative; }

.header { background-color: #05c0b8; padding: 15px 20px; display: flex; align-items: center; position: sticky; top: 0; z-index: 100; }
.backIcon { cursor: pointer; color: white; }
.headerTitle { color: white; flex-grow: 1; text-align: center; font-weight: 600; font-size: 16px; margin-right: 20px; }

.content { padding: 20px; }
.content p { font-size: 13px; color: #333; line-height: 1.6; margin-bottom: 15px; text-align: justify; }
.sectionTitle { font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #05c0b8; }
</style>

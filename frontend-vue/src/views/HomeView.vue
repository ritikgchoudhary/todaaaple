<template>
  <div class="home">
    <!-- Phone-width container (same as Login) -->
    <div class="mobileContainer">
    <!-- Header -->
    <header class="header">
      <router-link to="/" class="logoWrap">
        <img src="https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png" alt="DELTIN SPORT" class="headerLogo" />
      </router-link>
      <div class="headerActions">
        <template v-if="!auth.isLoggedIn">
          <router-link to="/login" class="btnRegister">
            <img src="https://img.bzvm68.com/site_common/H5_7_mobile/direction.png" alt="" class="btnIcon" />
            <span class="text">Register</span>
          </router-link>
          <router-link to="/login" class="btnLogin">
            <img src="https://img.bzvm68.com/site_common/H5_7_mobile/plus.png" alt="" class="btnIcon" />
            <span class="text">Log-in</span>
          </router-link>
        </template>
        <template v-else>
          <div class="headerBalance" @click="$router.push('/account')">
            <span class="text">₹ {{ (userBalance || 0).toFixed(2) }}</span>
          </div>
          <button class="btnLogout" @click="handleLogout" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </template>
      </div>
    </header>

    <!-- Logged in User Widget -->
    <div v-if="auth.isLoggedIn" class="homeUserWidget">
      <div class="huTop">
        <div class="huLeft">
          <div class="huAvatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="huDetails">
             <div class="huId">ID: {{ auth.user?.id || '0000' }}</div>
             <div class="huBal">₹ {{ (userBalance || 0).toFixed(2) }}</div>
          </div>
        </div>
        <div class="huRight">
          <router-link to="/deposit" class="huBtn huDeposit">Deposit</router-link>
          <router-link to="/withdrawal" class="huBtn huWithdraw">Withdraw</router-link>
        </div>
      </div>
    </div>

    <!-- Slider with overlay text (reference) - swipe to slide -->
    <section
      class="sliderSection"
      @touchstart="onSliderTouchStart"
      @touchend="onSliderTouchEnd"
    >
      <div class="sliderTrack" :style="{ transform: `translateX(-${sliderIndex * 100}%)` }">
        <div v-for="(img, i) in sliderImages" :key="i" class="sliderSlide">
          <div class="sliderOuter">
            <img :src="img" alt="slider" class="sliderImg" />
          </div>
        </div>
      </div>
      <div class="sliderDots">
        <button
          v-for="(_, i) in sliderImages"
          :key="i"
          :class="['sliderDot', { active: sliderIndex === i }]"
          :aria-label="`Slide ${i + 1}`"
          @click="sliderIndex = i"
        />
      </div>
    </section>

    <!-- Announcement bar (reference: label + text) -->
    <div class="announcement">
      <span class="announceLabel">
        <span class="announceIcon">&#128226;</span>
        Announcement
      </span>
      <span class="announceText">{{ noticeText }}</span>
    </div>

    <!-- Game type tabs (reference structure) -->
    <div class="game-type-wrapper">
      <div class="type-wrapper rightSideBlurMask">
        <div class="component-tab-scroll-root">
          <ul class="component-tab-scroll-list">
            <li
              v-for="cat in categories"
              :key="cat.id"
              class="component-tab-scroll-items"
              @click="activeCategory = cat.id"
            >
              <div :class="['type-item', { active: activeCategory === cat.id }]">
                <img :src="activeCategory === cat.id ? (cat.iconActive || cat.icon) : cat.icon" :alt="cat.label" />
                <span>{{ cat.label }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Game items: Sports / Live Casino (provider cards) -->
    <div v-if="activeCategory !== 'crash' && activeCategory !== 'slot' && activeCategory !== 'lottery'" class="game-item-box-wrapper">
      <div class="game-item-box">
        <div class="gt-wrapper" :class="{ 'gt-wrapper--live-casino': activeCategory === 'casino' }">
          <a
            v-for="(p, i) in displayProviders"
            :key="p.id"
            href="#"
            :class="['game-item', activeCategory === 'casino' ? 'card-b' : i === 0 ? 'card-b' : 'card-a']"
            :style="{ backgroundImage: `url(${p.bg})` }"
            @click.prevent="onProviderClick(p)"
          >
            <div class="character-bg" :style="{ backgroundImage: `url(${p.character})` }"></div>
            <div class="content">
              <div class="text-content">
                <div class="name">{{ p.name }}</div>
              </div>
              <div class="img-content">
                <img :src="p.logo" :alt="p.name" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- Lottery: Indian Lottery style – single column, grey bg, LOTTERY watermark, name + logo left, character right -->
    <div v-else-if="activeCategory === 'lottery'" class="game-item-box-wrapper">
      <div class="game-item-box">
        <div class="gt-wrapper gt-wrapper--lottery">
          <a
            v-for="p in lotteryProviders"
            :key="p.id"
            href="#"
            class="game-item game-item--lottery card-b"
            @click.prevent="onProviderClick(p)"
          >
            <div class="character-bg" :style="{ backgroundImage: p.character ? `url(${p.character})` : 'none' }"></div>
            <div class="content">
              <div class="text-content">
                <div class="name">{{ p.name }}</div>
                <div v-if="p.subtitle" class="lottery-subtitle">{{ p.subtitle }}</div>
              </div>
              <div class="img-content">
                <img :src="p.logo" :alt="p.name" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- Slot Game: left sidebar (Search, HOT, providers) + search bar + card-f grid -->
    <div v-else-if="activeCategory === 'slot'" class="game-menu-wrapper game-menu-wrapper--slot">
      <div class="type-wrapper type-wrapper--slot">
        <div class="left-type-wrapper">
          <div
            v-for="f in slotFilterItems"
            :key="f.id"
            :class="['gp-type-item', { active: slotFilterActive === f.id }]"
            @click="slotFilterActive = f.id"
          >
            <div>
              <span>{{ f.label }}</span>
              <img v-if="f.icon" :src="f.icon" :alt="f.label" class="gp-icon" />
              <template v-else>
                <img v-if="f.logoHide" :src="f.logoHide" alt="" class="gpPublisherLogoIsHide" />
                <img v-if="f.logoShow" :src="f.logoShow" alt="" class="gpPublisherLogoIsShow" />
              </template>
            </div>
          </div>
        </div>
        <div class="game-item-box-wrapper">
          <div class="search-bar">
            <div class="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <input
              v-model="slotSearchQuery"
              type="text"
              class="search-input"
              placeholder="Search game name"
            />
          </div>
          <div class="card-f-wrapper">
            <a
              v-for="g in displaySlotGames"
              :key="g.id"
              href="#"
              class="game-link card-f"
              :style="{ backgroundImage: g.img ? `url(${g.img})` : 'none' }"
              @click.prevent="onProviderClick(g)"
            >
              <div>
                <img class="heart" :src="heartIcon" alt="heart" />
              </div>
              <div v-if="g.isNew" class="new-icon"><span class="new-text">NEW</span></div>
              <div class="game-name-box">
                <span style="width: 80%;">{{ g.name }}</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Crash Game: card-f grid -->
    <div v-else class="game-item-box-wrapper">
      <div class="card-f-wrapper">
        <a
          v-for="g in crashGames"
          :key="g.id"
          href="#"
          class="game-link card-f"
          :style="g.img ? { backgroundImage: `url(${g.img})` } : {}"
          :title="getCrashGameName(g)"
          @click.prevent="onProviderClick(g)"
        >
          <div>
            <img class="heart" :src="heartIcon" alt="heart" />
          </div>
          <div class="game-name-box">
            <span>{{ getCrashGameName(g) }}</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as api from '../api/home'
import * as walletApi from '../api/wallet'

const router = useRouter()
const auth = useAuthStore()
const userBalance = ref(0)

const baseImg = 'https://img.bzvm68.com'
const sliderImages = [
  `${baseImg}/ark_common/arkUpload/carousel/40lKKSxzyxDYdLkC0RgwSG3359EIQIRAGQFe2Rco.jpg`,
  `${baseImg}/ark_common/arkUpload/gowin/prod/carousel/2ructZr9iy3oPmoFlRIL2Gj8vvECW5Dl0tDNChoA.jpg`,
  `${baseImg}/ark_common/arkUpload/gowin/prod/carousel/3D4X5nK36dzsKaWgiap2h2ycVLwWwi73IOnYCR6y.jpg`,
  `${baseImg}/ark_common/arkUpload/carousel/1b0hPBGcTmOOdwxU0gBr6yHtruWGkEUaXYjGC4kh.jpg`,
  `${baseImg}/ark_common/arkUpload/carousel/3BENIeUx7AZyURYyV9XqNwXUZ5NBYFHYbcTXpBRe.jpg`,
]
const sliderIndex = ref(0)
let sliderTimer = null
let sliderTouchStartX = 0
function onSliderTouchStart(e) {
  sliderTouchStartX = e.touches[0].clientX
}
function onSliderTouchEnd(e) {
  const endX = e.changedTouches[0].clientX
  const delta = sliderTouchStartX - endX
  const total = sliderImages.length
  if (delta > 40) {
    sliderIndex.value = (sliderIndex.value + 1) % total
  } else if (delta < -40) {
    sliderIndex.value = (sliderIndex.value - 1 + total) % total
  }
}

const noticeText = ref('Announcement | 13:50 (UTC+5.5) We apologize for any inconvenience.')
const activeCategory = ref('sports')

const categories = [
  { id: 'sports', label: 'Sports', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/4.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/4_active.png` },
  { id: 'casino', label: 'Live Casino', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/3.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/3.png` },
  { id: 'crash', label: 'Crash Game', icon: `${baseImg}/GoWin11/crash_game_icon/crash.png`, iconActive: `${baseImg}/GoWin11/crash_game_icon/crash.png` },
  { id: 'slot', label: 'Slot Game', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/2.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/2.png` },
  { id: 'lottery', label: 'Lottery', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/5.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/5.png` },
  { id: 'cards', label: 'Card Game', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/6.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/6.png` },
  { id: 'cockfight', label: 'Cockfight Live', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/8.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/8.png` },
]

const defaultCardBg = `${baseImg}/site_common/H5_7_mobile/game_item_background/bg-4.png`
const defaultProviders = [
  { id: '9w', name: '9WICKETS', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GP9W.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GP9W.png` },
  { id: 'lucky', name: 'Lucky Sports', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GPLS.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GPLS.png` },
  { id: 'saba', name: 'SABA', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GPOW.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GPOW-en_US.png` },
  { id: 'newbb', name: 'NewBB', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GPNBB.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GPBB-new bb.png` },
  { id: 'sbo', name: 'SBO', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GPSB2.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GPSB2.png` },
  { id: 'fb', name: 'FB', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GPFB.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GPFB-en_US.png` },
]

const gameImgBase = `${baseImg}/game/img2/en-US`
const crashGames = [
  { id: 'av', name: 'Aviator', img: `${gameImgBase}/GPJD/MjJfMjIwMDEjMTczNTAzMjc0OA==.png` },
  { id: 'avx', name: 'AviatorX', img: `${gameImgBase}/GPR8/NV9BdmlhdG9yWCMxNzU2Mjg1Mjg2.png` },
  { id: 'aeb', name: 'Aviator Extra Bet', img: `${gameImgBase}/GPJD/OV85MDIzIzE3NDY3Njk0ODY=.png` },
  { id: 'cd', name: 'Chicken Dash', img: `${gameImgBase}/GPJL/OF82OTAjMTc1ODA5ODc1Ng==.png` },
  { id: 'fd', name: 'Frog Dash', img: `${gameImgBase}/GPJL/OF82OTgjMTc2MjMyODYyNA==.png` },
  { id: 'cb', name: 'Cricket Burst', img: `${gameImgBase}/GPJD/OV85MDIyIzE3MzUwMjcxOTE=.png` },
  { id: 'fb', name: 'Firework Burst', img: `${gameImgBase}/GPJD/OV85MDE1IzE3MzUwMjgyNjI=.png` },
  { id: 'cp', name: 'Crash Puck', img: `${gameImgBase}/GPJL/OF81MTIjMTc1NzU2OTUwNw==.png` },
  { id: 'gr', name: 'Go Rush', img: `${gameImgBase}/GPJL/OF8yMjQjMTY4MjA2MzYzNA==.png` },
  { id: 'ct', name: 'Crash Touchdown', img: `${gameImgBase}/GPJL/OF80NTkjMTc0MDYyNDQ4Ng==.png` },
  { id: 'cc', name: 'Crash Cricket', img: `${gameImgBase}/GPJL/OF80NjkjMTcyMjgzNjE5MA==.png` },
  { id: 'cg', name: 'Crash Goal', img: `${gameImgBase}/GPJL/OF80MDcjMTcxODI2NDgzNQ==.png` },
  { id: 'flyx', name: 'FlyX', img: `${gameImgBase}/GPMG2/Q3Jhc2hfU01HX2ZseVgjMTc1Mzc3MjgxOA==.png` },
  { id: 'avi2', name: 'Aviator', img: `${gameImgBase}/GPYL2/MV84MDQjMTc1NDQ2ODQ2Mg==.png` },
  { id: 'crash', name: 'Crash', img: `${gameImgBase}/GPYL2/MV84MDEjMTcyOTY2Nzc3MQ==.png` },
]
const heartIcon = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ef4444"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>')

const slotFilterActive = ref('hot')
const slotSearchQuery = ref('')
const bannerBase = `${baseImg}/game/banner`
const slotFilterItems = [
  { id: 'search', label: 'Search', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/search.png` },
  { id: 'hot', label: 'HOT', icon: `${baseImg}/site_common/H5_8_mobile/game_type_icon/popular.png` },
  { id: 'jdb', label: 'JDB', logoHide: `${bannerBase}/R1BKRF8wX2RlZmF1bHRfM18xNzQ5NDUyOTM1.png`, logoShow: `${bannerBase}/R1BKRF8wX2RlZmF1bHRfNF8xNzQ5NDUyOTM2.png` },
  { id: 'r88', label: 'R88', logoHide: `${bannerBase}/R1BSOF8wX2RlZmF1bHRfM18xNjkxMTM5MDEz.png`, logoShow: `${bannerBase}/R1BSOF8wX2RlZmF1bHRfNF8xNjkxMTM4OTk2.png` },
  { id: 'jili', label: 'JILI', logoHide: `${bannerBase}/R1BKTF8wX2RlZmF1bHRfM18xNzQ5MTEwNDcz.png`, logoShow: `${bannerBase}/R1BKTF8wX2RlZmF1bHRfNF8xNzQ5MTEwNDcx.png` },
  { id: 'vp', label: 'VP', logoHide: `${bannerBase}/R1BWUF8wX2RlZmF1bHRfM18xNzU4Njk2OTA3.png`, logoShow: `${bannerBase}/R1BWUF8wX2RlZmF1bHRfNF8xNzU4Njk2OTA4.png` },
  { id: 'pg', label: 'PG', logoHide: `${bannerBase}/R1BQR18wX2RlZmF1bHRfM18xNzQ5MTk1NTA4.png`, logoShow: `${bannerBase}/R1BQR18wX2RlZmF1bHRfNF8xNzQ5MTk1NTA5.png` },
]
const slotGames = [
  { id: 's1', name: 'Aviator', img: `${gameImgBase}/GPJD/MjJfMjIwMDEjMTczNTAzMjc0OA==.png` },
  { id: 's2', name: 'Aviator Extra Bet', img: `${gameImgBase}/GPJD/OV85MDIzIzE3NDY3Njk0ODY=.png` },
  { id: 's3', name: 'Chicken Dash', img: `${gameImgBase}/GPJL/OF82OTAjMTc1ODA5ODc1Ng==.png` },
  { id: 's4', name: 'Frog Dash', img: `${gameImgBase}/GPJL/OF82OTgjMTc2MjMyODYyNA==.png` },
  { id: 's5', name: 'Go Rush', img: `${gameImgBase}/GPJL/OF8yMjQjMTY4MjA2MzYzNA==.png` },
  { id: 's6', name: 'Cleopatra', img: `${gameImgBase}/GPR8/Ml9TbG90Q2xlb3BhdHJhIzE3MTI4OTg5MzI=.png` },
  { id: 's7', name: 'Super Ace', img: `${gameImgBase}/GPJL/MV80OSMxNjQ4NDM2OTA2.png` },
  { id: 's8', name: 'Maya Gems', img: `${gameImgBase}/GPR8/Ml9TbG90Rm9ydHVuZUdlbXMjMTc0NTU0NDMyMg==.png` },
  { id: 's9', name: 'Piggy Bank', img: `${gameImgBase}/GPJD/MF8xNDA5MSMxNzM1MDk2Nzgw.png` },
  { id: 's10', name: 'Fortune Gems', img: `${gameImgBase}/GPJL/MV8xMDkjMTY0ODQzNjkwNg==.png` },
  { id: 's11', name: 'Fortune Gems 2', img: `${gameImgBase}/GPJL/MV8yMjMjMTY4ODU0MTY2NA==.png` },
  { id: 's12', name: 'Double Ace MultiXPLUS', img: `${gameImgBase}/GPVP/U0xPVF9WUF8yMzAwMzhfMSMxNzY1NTI0MTYx.png`, isNew: true },
  { id: 's13', name: 'Mines', img: '' },
  { id: 's14', name: 'Fortune Gems 3', img: '' },
  { id: 's15', name: 'Golden Empire', img: '' },
  { id: 's16', name: 'Super Ace Deluxe', img: '' },
  { id: 's17', name: 'Super Ace 2', img: '' },
  { id: 's18', name: 'Money Coming', img: '' },
  { id: 's19', name: 'Money Coming 2', img: '' },
  { id: 's20', name: 'Money Coming Expanded Bets', img: '' },
  { id: 's21', name: '7 UP 7 DOWN', img: '' },
  { id: 's22', name: 'Magic Ace', img: '' },
  { id: 's23', name: 'Crazy777 2', img: '' },
  { id: 's24', name: 'Monster Hunter S', img: '' },
  { id: 's25', name: 'Monopoly', img: '' },
  { id: 's26', name: 'Mighty Zeus', img: '' },
  { id: 's27', name: 'Royal War', img: '' },
  { id: 's28', name: 'Candy Island', img: '' },
  { id: 's29', name: 'The Secret Life of Pets', img: '' },
  { id: 's30', name: 'Mahjong 3+', img: '' },
  { id: 's31', name: 'Big Bass Bonanza', img: '' },
  { id: 's32', name: '777', img: '' },
  { id: 's33', name: 'Golden kingdom', img: '' },
  { id: 's34', name: 'Pirate Treasure', img: '' },
]
const displaySlotGames = computed(() => {
  const q = (slotSearchQuery.value || '').trim().toLowerCase()
  if (!q) return slotGames
  return slotGames.filter((g) => g.name.toLowerCase().includes(q))
})

const liveCasinoBg = `${baseImg}/site_common/H5_7_mobile/game_item_background/bg-3.png`
const lotteryBase = `${baseImg}/site_common/H5_7_mobile`
const lotteryProviders = [
  { id: 'india-lotto', name: 'INDIA LOTTO', subtitle: '', logo: `${lotteryBase}/game_logo/lottery/india_lotto.png`, character: `${lotteryBase}/hall_pics/lottery/india_lotto_character.png` },
  { id: 'sea-tcg', name: 'SEA', subtitle: 'TCGAMING', logo: `${lotteryBase}/game_logo/lottery/sea_tcgaming.png`, character: `${lotteryBase}/hall_pics/lottery/sea_character.png` },
  { id: 'bbin', name: 'BBIN', subtitle: 'THE GAMING BEAT', logo: `${lotteryBase}/game_logo/lottery/bbin.png`, character: `${lotteryBase}/hall_pics/lottery/bbin_character.png` },
]
const liveCasinoProviders = [
  { id: 'evo', name: 'EVO', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-1.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPEV.png` },
  { id: 'pt', name: 'PT', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-2.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPPT3.png` },
  { id: 'ezugi', name: 'Ezugi', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-3.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPEZ.png` },
  { id: 'sexy', name: 'SEXY', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-4.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPSX2.png` },
  { id: 'ssg', name: 'SSG', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-5.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPSS.png` },
  { id: 'mg', name: 'MG', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-6.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPMG2.png` },
  { id: 'pa', name: 'PA', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-7.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPAG2.png` },
]

const providers = ref([])
const displayProviders = computed(() => {
  if (activeCategory.value === 'casino') return liveCasinoProviders
  const list = providers.value && providers.value.length ? providers.value : defaultProviders
  return list.slice(0, 6)
})

function getCrashGameName(g) {
  if (!g || typeof g !== 'object') return 'Game'
  const n = g.name
  if (typeof n === 'string' && n.trim()) return n.trim()
  return 'Game'
}

async function onProviderClick(p) {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    const userId = auth.user.id
    const gameId = p.game_id || p.game_uid || p.id
    if (!gameId) {
      alert('Game ID not found')
      return
    }
    const res = await api.launchGame(userId, gameId)
    if (res.data && res.data.success && res.data.url) {
      window.location.href = res.data.url
    } else {
      alert('Failed to launch game: ' + (res.data?.msg || res.data?.message || 'Unknown error'))
    }
  } catch (err) {
    console.error(err)
    alert('Error launching game: ' + (err.response?.data?.message || err.message))
  }
}

onMounted(() => {
  sliderTimer = setInterval(() => {
    sliderIndex.value = (sliderIndex.value + 1) % sliderImages.length
  }, 4000)
})

onUnmounted(() => {
  if (sliderTimer) clearInterval(sliderTimer)
})

onMounted(async () => {
  if (auth.isLoggedIn && auth.user?.id) {
    try {
      const res = await walletApi.getUserHome(auth.user.id)
      if (res.data && res.data.length > 0) {
        userBalance.value = res.data[0].balance || 0
      }
    } catch (err) {}
  }
  try {
    const [noticeRes, providersRes] = await Promise.all([
      api.getNotice().catch(() => ({ data: {} })),
      api.getProviders().catch(() => ({ data: [] })),
    ])
    if (noticeRes?.data?.notice) {
      const n = noticeRes.data.notice
      noticeText.value = typeof n === 'string' ? n : `${n.heading || 'Announcement'} | ${n.body || ''}`
    }
    if (Array.isArray(providersRes?.data) && providersRes.data.length) {
      providers.value = providersRes.data.map((p, i) => {
        const def = defaultProviders[i % defaultProviders.length]
        return {
          id: p.id || p.name || i,
          name: p.name || p.title || 'Provider',
          bg: p.bg || def?.bg || defaultCardBg,
          character: p.character || p.image || p.img || def?.character,
          logo: p.logo || def?.logo || '',
        }
      })
    }
  } catch (_) {}
})
</script>

<style scoped>
.home {
  width: 100%;
  min-width: 100%;
  background: #f5f5f5;
  color: #1a1a1a;
}

.mobileContainer {
  width: 100%;
  max-width: min(430px, 100vw);
  margin: 0 auto;
  padding: 0 12px 90px;
  padding-left: max(12px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
  padding-bottom: max(90px, env(safe-area-inset-bottom));
  min-height: 100vh;
  box-sizing: border-box;
  background: #fff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin: 0 -12px 0;
  margin-left: calc(-1 * max(12px, env(safe-area-inset-left)));
  margin-right: calc(-1 * max(12px, env(safe-area-inset-right)));
  padding-left: max(12px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}
.logoWrap {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.headerLogo {
  height: 40px;
  width: auto;
  object-fit: contain;
}
.headerActions { display: flex; align-items: center; gap: 10px; }
.btnRegister, .btnLogin {
  padding: 8px 16px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btnRegister { background: #dc2626; }
.btnLogin { background: #2563eb; }
.btnIcon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* Slider: swipe to slide */
.sliderSection {
  position: relative;
  height: 180px;
  margin: 0 0 12px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
}
.sliderSection:active { cursor: grabbing; }
.sliderTrack {
  display: flex;
  height: 100%;
  transition: transform 0.4s ease-out;
}
.sliderSlide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
}
.sliderOuter {
  width: 100%;
  height: 100%;
}
.sliderImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.sliderDots {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 2;
}
.sliderDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}
.sliderDot.active {
  background: #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
}

.announcement {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f1f5f9;
  margin: 0 0 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #475569;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.announceLabel {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-weight: 600;
  color: #334155;
}
.announceIcon { font-size: 1rem; }
.announceText { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }

/* Game type tabs (reference: game-type-wrapper, type-item) */
.game-type-wrapper {
  margin-bottom: 16px;
  overflow: hidden;
}
.type-wrapper {
  overflow: hidden;
}
.type-wrapper.rightSideBlurMask {
  mask-image: linear-gradient(to right, black 0%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 0%, black 85%, transparent 100%);
}
.component-tab-scroll-root {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  padding: 0 0 8px;
}
.component-tab-scroll-root::-webkit-scrollbar { display: none; }
.component-tab-scroll-list {
  display: flex;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: min-content;
}
.component-tab-scroll-items {
  flex-shrink: 0;
  cursor: pointer;
  scroll-snap-align: start;
  scroll-snap-stop: normal;
}
.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  color: #666;
  transition: transform 0.2s, border-color 0.2s, background 0.2s, color 0.2s;
}
.type-item img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.type-item span { white-space: nowrap; }
.type-item.active {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1e40af;
  font-weight: 600;
}

/* Sports / Live Casino game items - reference structure */
.game-item-box-wrapper {
  padding: 0 0 6px;
}
.game-item-box {
  width: 100%;
}
.gt-wrapper {
  display: grid;
  gap: 12px;
}
.gt-wrapper--live-casino {
  grid-template-columns: 1fr;
}
.gt-wrapper--lottery {
  grid-template-columns: 1fr;
  gap: 12px;
}
.game-item--lottery {
  background-color: #e5e7eb;
  background-image: none;
  min-height: 120px;
}
.game-item--lottery::after {
  content: 'LOTTERY';
  position: absolute;
  right: 8%;
  top: 50%;
  transform: translateY(-50%);
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: 800;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.06);
  pointer-events: none;
  z-index: 0;
}
.game-item--lottery .character-bg {
  z-index: 1;
  background-size: contain;
  background-position: right center;
}
.game-item--lottery .content {
  z-index: 2;
}
.game-item--lottery .lottery-subtitle {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin: 0 0 6px;
}
.game-item--lottery .img-content img {
  max-width: 100px;
  max-height: 44px;
  object-fit: contain;
}
.game-item {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-decoration: none;
  color: #1a1a1a;
  overflow: hidden;
  position: relative;
  display: block;
  min-height: 100px;
}
.game-item.card-b {
  grid-column: span 2;
  min-height: 120px;
}
.gt-wrapper--live-casino .game-item.card-b {
  grid-column: auto;
}
.gt-wrapper--lottery .game-item.card-b {
  grid-column: auto;
}
.game-item.card-a {
  min-height: 100px;
}
.character-bg {
  position: absolute;
  inset: 0;
  background-size: contain;
  background-position: right center;
  background-repeat: no-repeat;
  pointer-events: none;
}
.game-item .content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 12px 14px;
  height: 100%;
  min-height: 100px;
}
.game-item.card-b .content { min-height: 120px; }
.game-item .text-content {
  flex: 0 0 auto;
}
.game-item .name {
  font-size: 1rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 6px;
}
.game-item .img-content {
  flex: 0 0 auto;
}
.game-item .img-content img {
  max-width: 72px;
  max-height: 32px;
  object-fit: contain;
}
.game-item.card-b .name { font-size: 1.1rem; }
.game-item.card-b .img-content img { max-width: 80px; max-height: 36px; }

/* Slot Game: left sidebar + search + card-f grid (reference game-menu-wrapper) */
.game-menu-wrapper--slot {
  padding: 0 0 20px;
}
.type-wrapper--slot {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.left-type-wrapper {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 4px 0;
  scrollbar-width: none;
}
.left-type-wrapper::-webkit-scrollbar { display: none; }
.gp-type-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  min-width: 56px;
}
.gp-type-item > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.gp-type-item .gp-icon,
.gp-type-item .gpPublisherLogoIsHide,
.gp-type-item .gpPublisherLogoIsShow {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.gp-type-item.active {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1e40af;
}
.game-menu-wrapper--slot .game-item-box-wrapper {
  flex: 1;
  min-width: 0;
}
.gt-wrapper--slot {
  display: block;
}
.gt-wrapper--slot .search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f1f5f9;
  border-radius: 10px;
  margin-bottom: 12px;
}
.gt-wrapper--slot .icon-container {
  flex-shrink: 0;
  color: #64748b;
  font-size: 1.2rem;
}
.gt-wrapper--slot .search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: #1a1a1a;
  outline: none;
}
.gt-wrapper--slot .search-input::placeholder {
  color: #94a3b8;
}
.gt-wrapper--slot .card-f-wrapper {
  margin-top: 0;
}
.game-link.card-f .new-icon {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
}
.game-link.card-f .new-text {
  display: inline-block;
  padding: 2px 6px;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  border-radius: 4px;
}

/* Crash Game: card-f grid – 4 columns, compact like reference */
.card-f-wrapper {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 0 0 6px;
}
.game-link.card-f {
  display: block;
  width: 100%;
  aspect-ratio: 0.85;
  min-height: 0;
  background-color: #1a1a1a;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  text-decoration: none;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.game-link.card-f > div:first-child {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.game-link.card-f .heart {
  width: 20px;
  height: 20px;
  max-width: 20px;
  max-height: 20px;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 0 1px rgba(0,0,0,0.3));
}
.game-link.card-f .game-name-box {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
  display: flex;
  align-items: center;
  overflow: hidden;
  min-width: 0;
}
.game-link.card-f .game-name-box span {
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  word-break: normal;
  display: block;
}

.navIconImg {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.homeUserWidget {
  background: linear-gradient(135deg, #05c0b8 0%, #0d9488 100%);
  margin: 10px 12px 15px;
  border-radius: 16px;
  padding: 16px;
  color: white;
  box-shadow: 0 4px 15px rgba(15, 118, 110, 0.2);
}

.huTop {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.huLeft {
  display: flex;
  align-items: center;
  gap: 12px;
}

.huAvatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.huDetails {
  display: flex;
  flex-direction: column;
}

.huId {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 500;
}

.huBal {
  font-size: 1.25rem;
  font-weight: 800;
  margin-top: 2px;
  letter-spacing: -0.01em;
}

.huRight {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.huBtn {
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  text-align: center;
  transition: all 0.2s;
}

.huDeposit {
  background: white;
  color: #0d9488;
}

.huDeposit:active {
  background: #f0f0f0;
}

.huWithdraw {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.huWithdraw:active {
  background: rgba(255, 255, 255, 0.3);
}

</style>

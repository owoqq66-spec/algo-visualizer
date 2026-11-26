---
sidebar: false
prev: false
next: false
---

<script setup>
import HeroHome from './components/HeroHome.vue'
</script>

<HeroHome />

<style>
.VPDoc {
  padding: 24px 32px !important;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
}
.VPDoc .container,
.VPDoc .content,
.VPDoc .content-container {
  max-width: 1440px !important;
  width: 100% !important;
  margin: 0 auto !important;
  padding: 0 !important;
}
.VPDoc .aside {
  display: none !important;
}
</style>
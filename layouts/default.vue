<template>
  <main flex font-mulish h-full>
    <NuxtLoadingIndicator />
    <Link rel="icon" type="image/x-icon" href="/favicon.svg" />
    <TheSidebar />
    <div flex flex-col flex-1 h-full>
      <slot />
      <TheFooter class="min-h-5%" shrink-0 flex items-center px-8 />
    </div>
  </main>
</template>

<style>
html, body , #__nuxt{
  height: 100vh;
  margin: 0;
  padding: 0;
}

/* html.dark {
  background: #222;
  color: white;
} */

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>

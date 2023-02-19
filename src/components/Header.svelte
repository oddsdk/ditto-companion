<script lang="ts">
  import { goto } from '$app/navigation'
  import { sessionStore, themeStore } from '../stores'
  import { DEFAULT_THEME_KEY, storeTheme, type ThemeOptions } from '$lib/theme'
  import Avatar from '$components/settings/Avatar.svelte'
  import DarkMode from '$components/icons/DarkMode.svelte'
  import Hamburger from '$components/icons/Hamburger.svelte'
  import LightMode from '$components/icons/LightMode.svelte'
  import Logo from '$components/icons/Logo.svelte'

  const setTheme = (newTheme: ThemeOptions) => {
    localStorage.setItem(DEFAULT_THEME_KEY, 'false')
    themeStore.set({
      ...$themeStore,
      selectedTheme: newTheme,
      useDefault: false,
    })
    storeTheme(newTheme)
  }
</script>

<header class="navbar flex bg-base-100 pt-4">
  <div class="lg:hidden">
    {#if $sessionStore.session}
      <label
        for="sidebar-nav"
        class="drawer-button cursor-pointer -translate-x-2"
      >
        <Hamburger />
      </label>
    {:else}
      <div
        class="flex items-center cursor-pointer gap-3"
        on:click={() => goto('/')}
        on:keypress={() => goto('/')}
      >
        <Logo />
      </div>
    {/if}
  </div>

  {#if !$sessionStore.session}
    <div
      class="hidden lg:flex flex-1 items-center cursor-pointer gap-3"
      on:click={() => goto('/')}
      on:keypress={() => goto('/')}
    >
      <Logo />
    </div>
  {/if}

  <div class="ml-auto">
    {#if $sessionStore.session}
      <a href="/settings" class="ml-2 cursor-pointer">
        <Avatar size="small" />
      </a>
    {/if}

    <span class="ml-2 cursor-pointer">
      {#if $themeStore.selectedTheme === 'light'}
        <span
          on:click={() => setTheme('dark')}
          on:keypress={() => setTheme('dark')}
        >
          <LightMode />
        </span>
      {:else}
        <span
          on:click={() => setTheme('light')}
          on:keypress={() => setTheme('light')}
        >
          <DarkMode />
        </span>
      {/if}
    </span>
  </div>
</header>

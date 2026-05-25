<script setup lang="ts">
type Sponsor = {
  name: string;
  logo: string;
  url: string;
  tier?: string;
};

type SponsorGroup = {
  tier: string;
  sponsors: Sponsor[];
};

type SponsorPageData = {
  title: string;
  description?: string;
  groups: SponsorGroup[];
};

const { data } = await useFetch<SponsorPageData>("/sponsors.json", {
  server: false,
  default: () => ({
    title: "murong's sponsors",
    description: "People and companies supporting this open source work.",
    groups: [],
  }),
});

useHead(() => ({
  title: data.value?.title ?? "murong's sponsors",
  meta: [
    {
      name: "description",
      content:
        data.value?.description ??
        "People and companies supporting this open source work.",
    },
  ],
}));
</script>

<template>
  <main class="min-h-screen bg-[oklch(0.99_0.002_250)]">
    <div class="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16 sm:px-10 sm:py-20">
      <section v-for="group in data?.groups" :key="group.tier" class="flex flex-col items-center gap-9">
        <h2 class="text-center text-3xl font-semibold tracking-[0] text-[oklch(0.16_0_0)]">
          {{ group.tier }}
        </h2>

        <div class="flex w-full flex-wrap justify-center gap-x-16 gap-y-10">
          <a v-for="sponsor in group.sponsors" :key="sponsor.name" :href="sponsor.url" target="_blank"
            rel="noopener noreferrer" :aria-label="sponsor.name"
            class="group flex h-24 w-48 items-center justify-center rounded-md transition duration-200 ease-out hover:-translate-y-0.5 hover:opacity-85 focus:outline-none focus-visible:ring-1 focus-visible:ring-[oklch(0.72_0.004_250)] focus-visible:ring-offset-6 focus-visible:ring-offset-[oklch(0.99_0.002_250)]">
            <img :src="sponsor.logo" :alt="sponsor.name" class="max-h-20 w-full object-contain" loading="lazy" />
          </a>
        </div>
      </section>
    </div>
  </main>
</template>

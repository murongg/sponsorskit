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
  contactEmail?: string;
  groups: SponsorGroup[];
};

const { data } = await useFetch<SponsorPageData>("/sponsors.json", {
  server: false,
  default: () => ({
    title: "murong's sponsors",
    description:
      "Thanks to the people and companies supporting my open source work.",
    contactEmail: "hi@mrong.me",
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
        "Thanks to the people and companies supporting my open source work.",
    },
  ],
}));

const hasSponsorGroups = computed(
  () => (data.value?.groups?.length ?? 0) > 0,
);
const displayedGroups = computed<SponsorGroup[]>(() =>
  hasSponsorGroups.value
    ? (data.value?.groups ?? [])
    : [{ tier: "Sponsors", sponsors: [] }],
);
</script>

<template>
  <main class="relative min-h-screen bg-[oklch(0.99_0.002_250)]">
    <a href="https://github.com/murongg" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile"
      class="group absolute right-0 top-0 h-24 w-24 text-[oklch(0.98_0.002_250)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[oklch(0.72_0.004_250)] focus-visible:ring-offset-4 focus-visible:ring-offset-[oklch(0.99_0.002_250)]">
      <span aria-hidden="true"
        class="absolute inset-0 bg-[oklch(0.16_0.004_250)] [clip-path:polygon(100%_0,0_0,100%_100%)] transition duration-200 ease-out group-hover:bg-[oklch(0.1_0.004_250)]" />
      <svg aria-hidden="true" viewBox="0 0 24 24" class="absolute right-4 top-4 h-7 w-7" fill="currentColor">
        <path fill-rule="evenodd" clip-rule="evenodd"
          d="M12 0C5.37 0 0 5.5 0 12.28c0 5.42 3.44 10.02 8.2 11.65.6.11.82-.27.82-.59 0-.29-.01-1.06-.02-2.08-3.34.74-4.04-1.65-4.04-1.65-.55-1.42-1.34-1.8-1.34-1.8-1.09-.76.08-.74.08-.74 1.2.09 1.84 1.27 1.84 1.27 1.08 1.88 2.83 1.34 3.52 1.02.11-.8.42-1.34.76-1.65-2.66-.31-5.46-1.36-5.46-6.07 0-1.34.47-2.43 1.24-3.29-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.26.96-.27 1.98-.41 3-.41s2.04.14 3 .41c2.29-1.59 3.3-1.26 3.3-1.26.66 1.69.24 2.94.12 3.25.77.86 1.24 1.95 1.24 3.29 0 4.72-2.8 5.75-5.47 6.06.43.38.81 1.13.81 2.28 0 1.65-.02 2.98-.02 3.39 0 .33.22.71.83.59A12.23 12.23 0 0 0 24 12.28C24 5.5 18.63 0 12 0Z" />
      </svg>
      <span class="sr-only">GitHub</span>
    </a>
    <div class="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-24 sm:px-10 sm:py-28">
      <section v-for="group in displayedGroups" :key="group.tier" class="flex flex-col items-center gap-8 sm:gap-10">
        <header class="flex flex-col items-center gap-12 text-center">
          <div class="flex max-w-xl flex-col items-center gap-4">
            <p v-if="data?.description" class="text-base leading-7 text-[oklch(0.46_0.004_250)]">
              {{ data.description }}
            </p>
            <p v-if="data?.contactEmail" class="text-sm leading-6 text-[oklch(0.42_0.004_250)]">
              If you would like to sponsor, contact
              <a :href="`mailto:${data.contactEmail}`"
                class="font-medium text-[oklch(0.18_0.004_250)] underline decoration-[oklch(0.75_0.004_250)] underline-offset-4 transition hover:text-[oklch(0.1_0.004_250)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[oklch(0.72_0.004_250)] focus-visible:ring-offset-4 focus-visible:ring-offset-[oklch(0.99_0.002_250)]">
                {{ data.contactEmail }}
              </a>
            </p>
          </div>
          <h2 v-if="hasSponsorGroups" class="text-center text-3xl font-semibold tracking-[0] text-[oklch(0.16_0_0)]">
            {{ group.tier }}
          </h2>
        </header>

        <div v-if="hasSponsorGroups" class="flex w-full flex-wrap justify-center gap-x-2 gap-y-14">
          <a v-for="sponsor in group.sponsors" :key="sponsor.name" :href="sponsor.url" target="_blank"
            rel="noopener noreferrer" :aria-label="sponsor.name"
            class="group flex h-24 w-20 items-center justify-center rounded-md transition duration-200 ease-out hover:-translate-y-0.5 hover:opacity-85 focus:outline-none focus-visible:ring-1 focus-visible:ring-[oklch(0.72_0.004_250)] focus-visible:ring-offset-6 focus-visible:ring-offset-[oklch(0.99_0.002_250)]">
            <img :src="sponsor.logo" :alt="sponsor.name" class="h-20 w-20 rounded-full object-cover" loading="lazy" />
          </a>
        </div>
        <img v-else src="/sponsors.svg" alt="Open for sponsors" class="h-auto w-full max-w-3xl" />
      </section>
    </div>
  </main>
</template>

<section class="flex flex-1 flex-col justify-center items-center max-w-[80vw]">
  <header class="flex flex-col text-center mb-6 md:mb-8">
    <h2 class="text-4xl text-gray-300 font-bold mb-1 md:mb-3 text-balance">
      <slot name="title" />
    </h2>
  </header>
  <slot name="content" />
</section>

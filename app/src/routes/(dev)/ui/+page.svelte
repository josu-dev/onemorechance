<script lang="ts">
  import ButtonIcon from '$comps/shared/ButtonIcon.svelte';
  import IconPlus from '$lib/icons/IconPlus.svelte';
</script>

<main class="main main-p-header">
  <h1 class="h2 text-white">UI Test</h1>
  <div class="divide-y space-y-8 grid md:grid-cols-2 md:divide-x md:divide-y-0">
    <section>
      <h2 class="h3 text-gray-100">Headings</h2>
      <div>
        <h1 class="h1 text-gray-200">Heading 1</h1>
        <h2 class="h2 text-gray-200">Heading 2</h2>
        <h3 class="h3 text-gray-200">Heading 3</h3>
        <h4 class="h4 text-gray-200">Heading 4</h4>
        <h5 class="h5 text-gray-200">Heading 5</h5>
        <h6 class="h6 text-gray-200">Heading 6</h6>
      </div>
    </section>
    <section>
      <h2 class="h3 text-gray-200">Icon buttons</h2>
      <div class="flex flex-wrap gap-4 text-gray-300">
        <ButtonIcon icon={IconPlus} size="xs" className="variant-primary" />
        <ButtonIcon icon={IconPlus} size="sm" className="variant-primary" />
        <ButtonIcon icon={IconPlus} size="md" className="variant-primary" />
        <ButtonIcon icon={IconPlus} size="lg" className="variant-primary" />
        <ButtonIcon icon={IconPlus} size="xl" className="variant-primary" />
      </div>
    </section>
    <section>
      <h2 class="h3 text-gray-200">Inputs</h2>
      <div class="flex flex-wrap gap-4 text-gray-300">
        <input type="checkbox" name="" id="" class="checkbox square-4">
        <input type="checkbox" name="" id="" class="checkbox variant-primary square-6">
        <input type="checkbox" name="" id="" disabled class="checkbox variant-primary square-8">
        <input type="checkbox" name="" id="" disabled checked class="checkbox variant-primary square-8">
      </div>
    </section>
  </div>

</main>

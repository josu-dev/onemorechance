<script lang="ts">
  import { randomLettersId } from '$lib/utils';
    import GameSettings from '$cmp/room/GameSettings.svelte';

  const modalId = randomLettersId();
</script>

<GameSettings />
<!-- Open the modal using ID.showModal() method -->
<button class="btn" onclick="{modalId}.showModal()">open modal</button>
<dialog id="{modalId}" class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Hello!</h3>
    <p class="py-4">Press ESC key or click the button below to close</p>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

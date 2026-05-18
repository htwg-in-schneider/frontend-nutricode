<script setup>
const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'accent' },
  onClick: { type: Function, default: null }
});

const buttonClass = `btn btn-${props.variant}`;
</script>

<template>
  <button :type="type" :class="buttonClass" @click="onClick">
    <slot />
  </button>
</template>

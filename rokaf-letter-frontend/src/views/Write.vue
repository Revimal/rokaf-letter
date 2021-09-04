<template>
    <div class="home">
        <Introduce msg="메인 화면"/>
        <Writer/>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Introduce from '@/components/Introduce.vue';
import Writer from '@/components/Writer.vue';

@Options({
  components: {
    Introduce,
    Writer,
  },
})
export default class Write extends Vue {}
</script>

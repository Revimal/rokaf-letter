<template>
    <div class="home">
        <Introduce msg="업데이트"/>
        <Pager/>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Introduce from '@/components/Introduce.vue';
import Pager from '@/components/Pager.vue';

@Options({
  components: {
    Introduce,
    Pager,
  },
})
export default class Home extends Vue {}
</script>

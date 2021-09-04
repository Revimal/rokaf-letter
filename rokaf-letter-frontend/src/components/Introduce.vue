<style lang="scss">
@use '~@/assets/sass/layout/introduce'
</style>

<template>
    <div class="introduce">
        <div class="picbox">
            <img class="profile" alt="프로필 사진" :src="profile.profile">
        </div>
        <h1>{{ msg }}</h1>
        <p class="intros">
            {{ profile.desc }} / 공군 {{ profile.number }}기 {{ profile.name }} 훈련병 위문 편지 사이트<br>
            <a href="https://www.instagram.com/snt_kim/" target="_blank" rel="noopener">인스타그램 찾아가기</a>
            <br>
        </p>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import axios from 'axios';

type ProfileInfo = {name: string, alias: string, desc: string, number: number, profile: string};

@Options({
    props: {
        msg: String
    },
    data: function(): unknown {
        return {
            profile: {
                name: "",
                alias: "",
                desc: "",
                number: 0,
                profile: "",
            }
        }
    },
    created: function(): void {
        axios.get("/api/profile").then(
            (res: any): void => {this.updateProfile(res.data as ProfileInfo)}
        )
    },
    methods: {
        updateProfile: function(data: ProfileInfo): void {
            this.profile.name = data.name;
            this.profile.alias = data.alias;
            this.profile.desc = data.desc;
            this.profile.number = data.number;
            this.profile.profile = data.profile;
        }
    }
})

export default class Introduce extends Vue {
    msg!: string
}
</script>
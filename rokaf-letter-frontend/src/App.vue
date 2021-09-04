<style lang="scss">
@use '~@/assets/sass/layout/app';
@use '~@/assets/sass/layout/nav';
@import '~@/assets/sass/base/common';
@import '~@/assets/sass/base/webfont';
</style>

<template>
    <div id="nav">
        <router-link to="/">메인 화면</router-link> |
        <router-link to="/letter">편지 쓰기</router-link>
    </div>
    <router-view/>
</template>
<style lang="scss">
@use '~@/assets/sass/layout/writer'
</style>

<template>
    <div class="writer">
        <form class="writer-form">
            <div class="writer-headerbox-wrap">
                <textarea class="postmark"
                name="postmark" v-model="postmark" :maxlength="namemax"
                placeholder="보내는 사람" rows=1 required></textarea>
                <textarea class="address"
                name="address" v-model="address" :maxlength="addrmax"
                placeholder="답장 받을 주소" rows=1 required></textarea>
                <div class="writer-sendmail-wrap">
                    <button class="sendmail">POST</button>
                </div>
                <br>
            </div>
            <div class="writer-remains-wrap">
                <span :class="dynstyledRemains">{{calculatedRemains}}자 남음</span>
            </div>
            <div class="writer-letterbox-wrap">
                <textarea class="letterbox"
                name="letterbox" v-model="letterbox" :maxlength="lettermax"
                placeholder="친구에게 전하고 싶은 말을 마음껏 적어주세요...!!!" required></textarea>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
    data: function(): unknown {
        return {
            namemax: 8,
            addrmax: 42,
            letterbox: "",
            lettermax: 1200,
            letterthresh: 100,
        }
    },
    watch: {
        letterbox: {
            handler: function(value: string, origin:string): void {
                let unacceptable: string | undefined = this.validateLetter(value)
                if (unacceptable != undefined) {
                    alert("입력할 수 없는 단어가 포함되어 있습니다!\n해당 단어: " + unacceptable);
                    this.letterbox = origin;
                }
            }
        }
    },
    computed: {
        calculatedRemains: function(): number {
            const limit: number = this.lettermax;
            let count: number = this.letterbox.length;

            return (limit - count);
        },
        dynstyledRemains: function(): string {
            const thresh: number = this.letterthresh;
            let remains:number = this.calculatedRemains;
            if (remains < thresh) {
                return 'remains-near-limit';
            }
            return 'remains';
        }
    },
    methods: {
        containsAny: function(value: string, wordlst: Array<string>): string | undefined {
            for (let idx = 0; idx < wordlst.length; ++idx) {
                let word: string = wordlst[idx];
                if (value.indexOf(word) != -1) {
                    return word;
                }
            }
            return undefined;
        },
        validateLetter: function(value: string): string | undefined {
            const blacklist = ['섹스'];
            return this.containsAny(value, blacklist);
        }
    }
})
export default class Writer extends Vue {}
</script>

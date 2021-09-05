<style lang="scss">
@use '~@/assets/sass/layout/pager'
</style>

<template>
    <div class="pager">
        <div id="pager-grid" class="pager-image-wrapper">
            <template v-for="(item, index) in images" :key="tupleKey(item, index)">
                <img :id="imgUID(index)" class="pager-image" :src="item.url" v-show="item.load"
                @load="updateData" @click="viewModal">
            </template>
        </div>
        <div class="modal" v-if="vmodal">
            <div class="overlay" @click="vmodal = false">
                <div class="viewable">
                    <img :src="vimage">
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import axios from 'axios';

type ImageObject = {url: string, desc: string, load: boolean, width: (number | undefined), height: (number | undefined)};

@Options({
    data: function(): unknown {
        return {
            prefix: "pager-img-",
            vmodal: false,
            vimage: "",
            images: [],
        }
    },
    methods:
    {
        tupleKey: function(item: ImageObject, index: number): string {
            const builtKey = `${item}-${index}`;
            return builtKey;
        },
        imgUID: function(index: number): string {
            const builtId = (this.prefix + String(index));
            return builtId;
        },
        parseIdx: function(name: string): number {
            const parsed: string = name.substring(this.prefix.length);
            return parseInt(parsed);
        },
        renderAgain: function(): void {
            let divRef: (HTMLElement | null) = document.getElementById("pager-grid") as HTMLElement;
            let styleRef: CSSStyleDeclaration;
            let colGap: number;
            let autoRows: number;

            if (divRef == null) {
                console.log("divRef='pager-grid' is null");
                return;
            }

            styleRef = window.getComputedStyle(divRef as Element);
            colGap = parseInt(styleRef.getPropertyValue("column-gap"));
            autoRows = parseInt(styleRef.getPropertyValue("grid-auto-rows"));

            for (let idx = 0; idx < this.images.length; ++idx) {
                let iterRef: ImageObject = this.images[idx];
                let strUID: string = this.imgUID(idx);
                let imgRef: (HTMLElement | null);

                if (!iterRef.load) {
                    continue;
                }

                imgRef = document.getElementById(strUID) as HTMLElement;
                if (imgRef == null) {
                    console.log("imgRef='" + strUID + "' is null");
                    return;
                }

                imgRef.style.gridRowEnd = `span ${Math.ceil((imgRef.scrollHeight / autoRows) + (colGap / autoRows))}`;
            }
        },
        viewModal: function(event: Event): void {
            let eventRef: (HTMLImageElement | null) = event.target as HTMLImageElement;
            const eventIdx: number = eventRef == null ? NaN : this.parseIdx(eventRef.id);

            if (isNaN(eventIdx) || eventIdx > this.images.length) {
                console.log("eventIdx='" + eventIdx + "' is invalid");
                return;
            }

            this.vimage = this.images[eventIdx].url;
            this.vmodal = true;
        },
        updateData: function(event: Event): void {
            let eventRef: (HTMLImageElement | null) = event.target as HTMLImageElement;
            const eventIdx: number = eventRef == null ? NaN : this.parseIdx(eventRef.id);
            let dataRef: ImageObject;

            if (isNaN(eventIdx) || eventIdx > this.images.length) {
                console.log("eventIdx='" + eventIdx + "' is invalid");
                return;
            }

            dataRef = this.images[eventIdx];
            dataRef.width = eventRef.naturalWidth;
            dataRef.height = eventRef.naturalHeight;
            dataRef.load = true;

            this.renderAgain();
        },
        updateView: function(): void {
            this.renderAgain();
        }
    },
    created: function(): void {
        axios.get("/api/images").then(
            (res: any): void => {res.data.forEach((docinfo: any): void => {
                axios.get("/api/images/" + docinfo.id).then((doc: any): void => {
                    var elem = doc.data;
                    this.images.push(
                        {
                            url: elem.url,
                            desc: elem.desc,
                            load: false,
                            width: undefined,
                            height: undefined,
                        }
                    );
                });
            });
        });
        window.addEventListener("resize", this.updateView);
    },
    destroyed: function(): void {
        window.removeEventListener("resize", this.updateView);
    },
    mounted: function(): void {
        document.onreadystatechange = (): void => {
            if (document.readyState == "complete") {
                this.renderAgain();
                window.setTimeout(this.renderAgain, 2000);
                window.setTimeout(this.renderAgain, 5000);
            }
        }
    }
})

export default class Pager extends Vue {}
</script>

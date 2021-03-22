<template>
    <div class="box">
        
        <Popover v-model:visible="visible" trigger="click" placement="bottomLeft">
            <template #title>
                <span>Emoji</span>
            </template>
            <template #content >
                <div class="emoji-panel">
                    <CaretLeftOutlined class="emoji-btn" @click="changePage(-1)"/>
                    <div class="emoji-group">
                        <span v-for="emoji in emojiList[emojiIndex]" :key="emoji" class="emoji" @click="clickEmoji">{{emoji}}</span>
                    </div>
                    <CaretRightOutlined class="emoji-btn" @click="changePage(1)"/>
                </div>
            </template>
            <SmileOutlined class="btn" @click="visible=!visible"/>
        </Popover>
    </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed} from 'vue';
import { SmileOutlined, CaretLeftOutlined, CaretRightOutlined } from "@ant-design/icons-vue";
import { Popover, Carousel, Modal } from "ant-design-vue";

export default defineComponent({
  name: 'Emoji',
  components:{
      SmileOutlined,
      Popover,
      Carousel,
      Modal,
      CaretLeftOutlined,
      CaretRightOutlined
  },
  setup: (props, { emit }) => {
    const visible = ref<boolean>(false);
    const _emojiList = ref<string[]>(
        ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", 
        "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", 
        "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", 
        "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", 
        "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", 
        "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", 
        "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", 
        "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", 
        "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", 
        "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", 
        "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", 
        "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", 
        "🙀", "😿", "😾"]);
    
    const emojiList = computed(() =>{
        let list:string[][] = [];
        let length = 40;

        while(_emojiList.value.length) {
            list = [...list, [..._emojiList.value.splice(0, length)]]
        }
        return list
    });
    
    const emojiIndex = ref<number>(0);
    const changePage = (num) => {
        
        if(emojiIndex.value + num >= 0 && emojiIndex.value + num < emojiList.value.length -1){
            emojiIndex.value += num;
        } else if(emojiIndex.value + num < 0) {
             emojiIndex.value = emojiList.value.length -1;
        } else if(emojiIndex.value + num >= emojiList.value.length -1){
            emojiIndex.value = 0;
        }
    }
    const clickEmoji = function(e):void{
        visible.value = false;
        emit("selectEmoji", e.target.innerHTML);
    }
    return { visible, emojiList, clickEmoji, emojiIndex, changePage }
  }
})
</script>

<style scoped lang="scss">
    .emoji-modal {
        position: absolute;
        bottom: 30px;
    }
    .box{
        display: flex;
        width: 0;
        .btn{
            font-size: 20px;
            transition: 0.3s;
            cursor: pointer;
            &:hover{
                color:aquamarine;
            }
        }
        
    }
    .emoji-panel {
            max-width: 80vw;
            overflow: hidden;
            display: flex;
            align-items: center;
            /* max-height: 100px; */
            .emoji-btn{
                cursor: pointer;
                transition: 0.3s;
                &:hover {
                    color:rgb(212, 252, 238);
                }
            }
            .emoji-group{
                display: flex;
                flex-wrap: wrap;
                .emoji {
                    padding: 4px;
                    cursor: pointer;
                    transition: 0.3s;
                    font-size: 20px;
                    &:hover{
                        color:rgb(212, 252, 238);
                    }
                }
            }
            
        }
    
</style>

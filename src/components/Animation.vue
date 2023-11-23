<template>
  <div class="g-container">
    <div class="g-box">
      <ul id="j-main" class="g-main" :style="`--xPos:${xPos}px; --yPos:${yPos}px`">
        <li v-for="(item) in state.items" :key="item.id"></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';

export default {
  setup() {
    const curX = ref(0);
    const curY = ref(0);
    const remoteX = ref(0);
    const remoteY = ref(0);
    const state = reactive({
      items: []
    });

    let broadcastChannel;

    const xPos = computed(() => {
      return remoteX.value - curX.value;
    });
    const yPos = computed(() => {
      return remoteY.value - curY.value;
    });

    function createBroadcastChannel() {
      broadcastChannel = new BroadcastChannel('g-ani');
      broadcastChannel.onmessage = handleMessage;
    }

    function sendMessage(data) {
      broadcastChannel.postMessage(data);
    }

    function handleMessage(event) {
      remoteX.value = event.data[0];
      remoteY.value = event.data[1];
    }

    function resizeEventBind() {
      // window.addEventListener('resize', () => {
      //   const pos = getCurPos();
      //   sendMessage(pos);
      //   initCurPos(pos);
      // });

      // TODO: 窗口拖动有权限问题
      // const firstScreen = (await window.getScreenDetails());
      // firstScreen.addEventListener('currentscreenchange', () => {
      //   const pos = getCurPos();
      //   sendMessage(pos);
      //   init(pos);
      // });

      // 临时的兼容方案，Maybe 性能不是很好
      function frameSetPos() {
        const pos = getCurPos();
        sendMessage(pos);
        initCurPos(pos);

        window.requestAnimationFrame(frameSetPos);
      }

      window.requestAnimationFrame(frameSetPos);
    }

    function getCurPos() {
      const barHeight = window.outerHeight - window.innerHeight;
      const element = document.getElementById('j-main');
      const rect = element.getBoundingClientRect();

      // 获取元素相对于屏幕左上角的 X 和 Y 坐标
      const x = rect.left + window.screenX; // 元素左边缘相对于屏幕左边缘的距离
      const y = rect.top + window.screenY + barHeight;// 元素顶部边缘相对于屏幕顶部边缘的距离

      return [x, y];
    }

    function initArray() {
      for(let i = 0; i < 100; i++) {
        state.items.push({
          id: new Date().getTime()
        });
      }
    }

    function initCurPos(pos) {
      pos = getCurPos() || pos;

      curX.value = pos[0];
      curY.value = pos[1];
    }
    
    onMounted(() => {
      createBroadcastChannel();
      resizeEventBind();
      initArray()
      initCurPos();
    });

    return {
      xPos,
      yPos,
      state
    };
  }
};
</script>



<style lang="scss">
$count: 100;
.g-container {
  width :100vw;
  height: 100vh;
  background: #000;
  display: flex;
  filter: blur(3px) contrast(100);
}
.g-box {
  position: relative;
  margin: auto;
  width: 20px;
  height: 20px;  
}
.g-main {
  --x: var(--xPos);
  --y: var(--yPos);
  
  li {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    animation: 
      move 10s infinite linear;
  }
  @for $i from 1 through $count {
    li:nth-child(#{$i}) {
      background: rgb(255, random(100) + 155, random(100) + 155);
      animation-duration: #{random(12000) + 3000}ms;
      animation-delay: #{$i * (-10000 / $count) - random(10000)}ms;
      scale: #{random(2000) / 1000 + 0.2};
    } 
  }
}

@keyframes move {
  0% {
    translate: 0 0;
  }
  100% {
    translate: var(--x) var(--y);
  }
}

@keyframes change {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(30deg);
  }
}
</style>

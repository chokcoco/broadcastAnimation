<template>
  <div class="g-container">
    <div class="g-box">
      <ul id="j-main" class="g-main" :style="`--xPos:${xPos}px; --yPos:${yPos}px`">
        <li v-for="(item) in state.items" :key="item.id"></li>
      </ul>
      <ul class="g-main2">
        <li v-for="(item) in state.itemsCircle" :key="item.id"></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';

export default {
  setup() {
    let  id = 0;

    const curX = ref(0);
    const curY = ref(0);
    const remoteX = ref(0);
    const remoteY = ref(0);
    const state = reactive({
      items: [],
      itemsCircle: []
    });

    const xPos = computed(() => {
      return remoteX.value - curX.value;
    });
    const yPos = computed(() => {
      return remoteY.value - curY.value;
    });

    function initLocalStorage() {
      let tabArray = JSON.parse(localStorage.getItem('tab_array'));
      if (!tabArray) {
        const tabIndex = 1;
        id = tabIndex;
        localStorage.setItem('tab_array', JSON.stringify([tabIndex]));
      } else {
        const tabIndex = tabArray[tabArray.length - 1] + 1;
        id = tabIndex;
        const newTabArray = [...tabArray, tabIndex];
        localStorage.setItem('tab_array', JSON.stringify(newTabArray));
      }
    }

    function setLocalStorage(data) {
      localStorage.setItem(`tab_index_${id}`, JSON.stringify(data));
    }

    function handleMessage(data) {
      const rArray = JSON.parse(data);
      remoteX.value = rArray[0];
      remoteY.value = rArray[1];
    }

    function resizeEventBind() {
      // window.addEventListener('resize', () => {
      //   const pos = getCurPos();
      //   setLocalStorage(pos);
      //   initCurPos(pos);
      // });

      // TODO: 窗口拖动有权限问题
      // const firstScreen = (await window.getScreenDetails());
      // firstScreen.addEventListener('currentscreenchange', () => {
      //   const pos = getCurPos();
      //   setLocalStorage(pos);
      //   init(pos);
      // });

      window.addEventListener('storage', (event) => {
        console.log('localStorage 变化了！', event);
        console.log('键名：', event.key);
        console.log('变化前的值：', event.oldValue);
        console.log('变化后的值：', event.newValue);
        handleMessage(event.newValue);
      });

      // 临时的兼容方案，Maybe 性能不是很好
      function frameSetPos() {
        const pos = getCurPos();
        setLocalStorage(pos);
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
      for(let i = 0; i < 500; i++) {
        state.items.push({
          id: new Date().getTime()
        });
      }
      for(let i = 0; i < 500; i++) {
        state.itemsCircle.push({
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
      initLocalStorage();
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
$count: 500;
$countCircle: 500;
ul {
  list-style-type: none;
}
.g-container {
  width :100vw;
  height: 100vh;
  background: #000;
  display: flex;
  // filter: blur(3px) contrast(100);
}
.g-box {
  position: relative;
  margin: auto;
  width: 1.5px;
  height: 1.5px;  
}
.g-main {
  --x: var(--xPos);
  --y: var(--yPos);
  
  li {
    position: absolute;
    inset: 0;
    padding: 0;
    border-radius: 50%;
    animation: move 10s infinite linear;
  }
  @for $i from 1 through $count {
    li:nth-child(#{$i}) {
      --rx: #{random(20) - 10}px;
      --ry: #{random(20) - 10}px;
      background: #fff;
      animation-duration: #{random(12000) + 3000}ms;
      animation-delay: #{$i * (-10000 / $count) - random(10000)}ms;
      scale: #{random(2000) / 1000 + 0.2};
    } 
  }
}

.g-main2 {
  position: absolute;
  width: 3px;
  height: 3px;
  padding: 0;
  transform-style: preserve-3d;
  perspective: 500px;

  li {
    position: absolute;
    inset: 0;
    border-radius: 50%;
  }
  @for $i from 1 through $countCircle {
    li:nth-child(#{$i}) {
      --fromX: #{random(360)}deg;
      --fromY: #{random(360)}deg;
      --fromZ: #{random(360)}deg;
      --toX: #{random(360)}deg;
      --toY: #{random(360)}deg;
      --toZ: #{random(360)}deg;
      --fromDis: 200px;
      --toDis: 200px;
      // --fromDis: #{(ramdom(10) > 5) ? (random(150) + 10) : (random(50) + 150)}px;
      // --toDis: #{(ramdom(10) > 5) ? (random(150) + 10) : (random(50) + 150)}px;
      background: #fff;
      animation: rotate 10s infinite alternate,
        fadeIn 5s infinite;
      animation-duration: #{random(5000) + 3000}ms;
      animation-delay: #{$i * (-10000 / $count) - random(20000)}ms;
      scale: #{random(200) / 1000 + 0.9};
    } 
  }
}

@keyframes rotate {
  0% {
    transform: 
      rotateX(var(--fromX)) 
      rotateY(var(--fromY)) 
      rotateZ(var(--fromZ)) 
      translateZ(var(--fromDis));
  }
  100% {
    transform: 
      rotateX(var(--toX)) 
      rotateY(var(--toY)) 
      rotateZ(var(--toZ)) 
      translateZ(var(--toDis));
  }
}

@keyframes fadeIn {
  0%,
  90% {
    opacity: 1;
  }
  95%,
  100% {
    opacity: 0;
  }
}

@keyframes move {
  0% {
    translate: calc(var(--ry) * 15) calc(var(--rx) * 15);
  }
  100% {
    translate: calc(var(--x) + var(--rx)) calc(var(--y) + var(--ry));
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

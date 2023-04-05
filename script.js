let c = document.getElementById('canvas')
let ctx = c.getContext('2d')
c.width = window.innerWidth
c.height = window.innerHeight

let mouse = {x: c.width/2, y: c.height/2, hasMoved: false, lastMoved: 0}
document.addEventListener('mousemove',(e)=>{
  mouse.y = e.clientY - c.getBoundingClientRect().y
  mouse.x = e.clientX - c.getBoundingClientRect().x
  mouse.hasMoved = true
  mouse.lastMoved = Date.now()
})

class ParticleSystem {
  constructor(
    {
      num = 10,
      size=5,
      pushDist=25
    } = opts
  ) {
    this.particles = [];
    for (let i = 0; i < num; i++) {
      let x = i % Math.sqrt(num)
      this.particles.push({
        x: Math.random()*c.width,
        y: Math.random()*c.height,
        color: `hsl(${Math.random()*360},70%,70%)`,
        vel: {
          x: 0,
          y: 0
        },
        id: i
      })
    }

    this.particleSize = size
    this.pushDist = pushDist
  }
  draw() {
    ctx.clearRect(0,0,c.width,c.height)
    for (let i of this.particles) {
      ctx.beginPath()
      ctx.arc(i.x,i.y,this.particleSize,0,Math.PI*2)
      ctx.fillStyle = i.color;
      ctx.fill()
    }
  }
  update() {
    let frameStart = performance.now()
    for (let i of this.particles) {
      let leftSide = i.x - this.particleSize
      let rightSide = i.x + this.particleSize
      let topSide = i.y - this.particleSize
      let bottomSide = i.y + this.particleSize
      let dist
      // console.log((dist = Math.dist(mouse.x,mouse.y,i.x,i.y)) && (dist <= this.pushDist));
      if (
        leftSide - this.pushDist <= mouse.x && mouse.x <= rightSide + this.pushDist &&
        topSide - this.pushDist <= mouse.y && mouse.y <= bottomSide + this.pushDist &&
        (()=>{dist = Math.dist(mouse.x,mouse.y,i.x,i.y);return true})() && (dist <= this.pushDist)
      ) {
        // console.log(dist);
        let ang = Math.atan2(i.x - mouse.x, i.y - mouse.y)
        // i.color = 'red'
        i.vel.x += Math.sin(ang)*(this.pushDist/dist)*0.75
        i.vel.y += Math.cos(ang)*(this.pushDist/dist)*0.75
      }
      i.x += i.vel.x
      i.y += i.vel.y
      i.vel.x *= 0.9
      i.vel.y *= 0.9
      i.x = wrap(i.x,0,c.width)
      i.y = wrap(i.y,0,c.height)
      // if (i.vel.x == 0 && i.vel.y == 0) {
      //   i.vel.x = noise.perlin2(i.id,0)*5
      //   i.vel.y = noise.perlin2(0,i.id)*5
      // }
    }
    this.draw()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = 'white';
    ctx.fillText(Math.floor(1000/(performance.now()-frameStart))+'FPS',0,0)
    // requestAnimationFrame(()=>{this.update})
    // setTimeout(()=>{this.update()},16);
  }
}
function wrap(val, start, end) {
  let dif = end - start
  while (val <= start) {
    val = end-Math.abs(val-start)
  }
  val = start+((val-start) % dif)
  return val
}

noise.seed('BootLegAidan')
let ps = new ParticleSystem({num:1000,pushDist:50})
ps.pushDist = ((window.innerHeight+window.innerWidth)/2)*0.25
function tick() {
  if (!mouse.hasMoved) {
    // mouse.x = (c.width*noise.perlin2(Date.now()/1000,0))+(c.width*0.5)
    // mouse.y = (c.height*noise.perlin2(0,Date.now()/1000))+(c.height*0.5)

    mouse.x += noise.perlin2(performance.now()/2500,0.123)*10
    mouse.y += noise.perlin2(0.987,performance.now()/2500)*10
    mouse.x = wrap(mouse.x,0,c.width)
    mouse.y = wrap(mouse.y,0,c.height)

  } else if (Date.now()-mouse.lastMoved > 5000) {
    mouse.hasMoved = false
  }
  ps.update()
  ctx.beginPath()
  ctx.arc(mouse.x,mouse.y,10,0,Math.PI*2)
  ctx.fill()
  requestAnimationFrame(tick);
  // setTimeout(tick,16);
}
tick()

window.addEventListener('resize',(e)=>{
  c.width = window.innerWidth
  c.height = window.innerHeight
  ps.pushDist = ((window.innerHeight+window.innerWidth)/2)*0.25
});

//Scroll magic documentation here
//http://scrollmagic.io/docs/index.html

//Adding some visual elements
const w = d3.select('#section-2').node().clientWidth;
const h = d3.select('#section-2').node().clientHeight;
const svg = d3.select('#section-2').append('svg')
	.attr('width', w)
	.attr('height', h);
const circle1 = svg.append('circle').attr('cx',20).attr('cy',h/2).attr('r',20).style('fill','blue');
const circle2 = svg.append('circle').attr('cx',w-20).attr('cy',h/2).attr('r',20).style('fill','red');

//Define a controller
const controller = new ScrollMagic.Controller();

//Define scenes
//Scene 1 is triggered 100px after start, and last for 300px
const scene1 = new ScrollMagic.Scene({
		offset:100,
		duration:300
	})
	.setPin('#section-1') //pin this element for the duration of the scene
	.addIndicators()
	.addTo(controller);

//Scene 2 is triggered by a specific element
const scene2 = new ScrollMagic.Scene({
		triggerElement: '#section-2',
		duration: d3.select('#section-2').node().clientHeight
	})
	.addIndicators()
	.on('progress', e => {
		//"Tween" the two circles
		circle1.attr('cx', e.progress*(w-20) + (1-e.progress)*20);
	})
	.addTo(controller);

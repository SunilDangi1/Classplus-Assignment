
    //  contains the common functions that will be used in our App at several places

/* Debounce function to discard a number of fastpace events */
export function debounce(func, wait, immediate) {
	var time;
	return function() {
		var context = this,
			args = arguments;
		var later = function() {
			time = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !time;
		clearTimeout(time);
		time = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

/* Throttle function for constant execution of a function after particular secs */
export function throttle(fn, threshhold, scope) {
	threshhold || (threshhold = 250);
	var lastone, Timer;
	return function() {
		var context = scope || this;
		var now = new Date(),
			args = arguments;
		if (lastone && now < lastone + threshhold) {
			clearTimeout(Timer);
			Timer = setTimeout(function() {
				lastone = now;
				fn.apply(context, args);
			}, threshhold);
		} else {
			lastone = now;
			fn.apply(context, args);
		}
	};
}

/* Check HTTP status  */
export function httpStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	} else {
		throw response;
	}
}



/*  image url */
export function imageUrl(farm, server, id, secret) {
	return `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`;
}

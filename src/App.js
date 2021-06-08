import React from "react";
import "./App.css";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import ImageList from "./components/ImageList.js";
import ImagePopUp from "./components/ImagePopUp.js";
import constants from "./Url.js";
import { debounce, throttle, httpStatus} from "./Mislaneous.js";

/*  document height */
function getHeight() {
	const body = document.body;
	const html = document.documentElement;

	return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
}

/*  scrollTop height */
function getScrollTop() {
	return window.pageYOffset !== undefined
		? window.pageYOffset
		: (document.documentElement || document.body.parentNode || document.body).scrollTop;
}
/* Check if scroll reached bottom */
function areaAvailable() {
	return getScrollTop() < getHeight() - window.innerHeight;
}
/* To parse response to JSON object */
export function parsetoJSON(response) {
	return response.json();
}

export default class App extends React.Component {
	constructor(props) {
		super(props);
		const queriesFromStorage = JSON.parse(localStorage.getItem(constants.STORAGE_KEY));
		this.state = {
			searchText: "",
			
			imageList: [],
			pageNumber: 1,
			showPopUp: false,
			popUpImage: null,
			queries: queriesFromStorage ? queriesFromStorage : []
		};
		// Function bindings
		this.onSearchInpChange = this.onSearchInpChange.bind(this);
		this.handleImgClick = this.handleImgClick.bind(this);
		this.popUpHide = this.popUpHide.bind(this);
		this.scroll = this.scroll.bind(this);
	}
	/*infinite scrolling */
	componentDidMount() {

		window.onscroll = throttle(() => {
			if (areaAvailable()) return;
			this.scroll();
		}, 1000);

		/* Debounced function for search based on input text */
		this.makeDebouncedSearch = debounce(() => {
			/* Save search query */
			this.state.queries.push(this.state.searchText);
			this.setState({ queries: this.state.queries }, this.updateLocalStorage());

		
			const url = constants.BASE_URL + "&text=" + this.state.searchText;
			fetch(url)
				.then(httpStatus)
				.then(parsetoJSON)
				.then(resp => {
					this.setState({ imageList: resp.photos.photo });
				})
				.catch(err => {
					console.log(err);
				});
		}, 1000);
	}
// upodate laoclstorage
	updateLocalStorage() {
		localStorage.setItem(constants.STORAGE_KEY, JSON.stringify(this.state.queries));
	}

	onSearchInpChange(evt) {
		const searchText = evt.currentTarget.value;
		this.setState({ searchText });
		const trimtext = searchText.replace(/\s+$/, "");
		if (trimtext.length) this.makeDebouncedSearch(trimtext);
	}

	scroll() {
		let url = constants.BASE_URL + "&text=" + this.state.searchText + "&page=" + (this.state.pageNumber + 1);
		fetch(url)
			.then(httpStatus)
			.then(parsetoJSON)
			.then(resp => {
				resp.photos.photo.forEach(photo => this.state.imageList.push(photo));
				this.setState({
					pageNumber: resp.photos.page,
					imageList: this.state.imageList
				});
			})
			.catch(err => {
				console.log(err);
			});
	}

	handleImgClick(idx) {
		this.setState({ popUpImage: this.state.imageList[idx] });
	}

	popUpHide() {
		this.setState({ popUpImage: null });
	}

	render() {
		return (
			<div className="app">
				<div className="app-header">
					<h2 style={{ margin: "1rem 0" }}>Flickr Search</h2>
					
					<div className="h-flex jc ac search-bar">
						<input
							type="text"
							className="search-input"
							 placeholder="Photos, people, or groups"
							value={this.state.searchText}
							onChange={this.onSearchInpChange}
						/>
					</div>
					{this.state.queries.length > 0 &&
						<div style={{ marginTop: "16px" }}>
							<h5 style={{ marginBottom: "5px" }}>Recent Searches</h5>
							<ul className="h-flex jc">
								{this.state.queries.map((query, idx) =>
									<li key={idx} className="query">
										{query}
									</li>
								)}
							</ul>
						</div>}
				</div>
				<div className="app-content" ref="appContent">
					{this.state.imageList.length
						? <ImageList images={this.state.imageList} onImageClick={this.handleImgClick} />
						: <p style={{ margin: "1rem 0" }}>Try searching for some image in the search bar</p>}
					<ReactCSSTransitionGroup
						transitionName="popup-container"
						transitionEnterTimeout={400}
						transitionLeaveTimeout={200}
					>
						{this.state.popUpImage &&
							<ImagePopUp image={this.state.popUpImage} onHide={this.popUpHide} />}
					</ReactCSSTransitionGroup>
				</div>
			</div>
		);
	}

	componentWillUnmount() {
		// Remove the listener for cleanup
		window.onscroll = undefined;
	}
}

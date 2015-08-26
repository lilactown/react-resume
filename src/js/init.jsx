// init

const React = require('react');
const injectTapEventPlugin = require("react-tap-event-plugin");
const Immutable = require('immutable');
const Cursor = require('immutable/contrib/cursor');
var diff = require('immutablediff');
const {List, Map} = Immutable;
injectTapEventPlugin();
React.initializeTouchEvents();

const ResumeModel = require('./models/ResumeModel');
const getResumeJSON = require('./libs/getResumeJSON');
const HistoryModel = require('./models/HistoryModel');

const Resume = require('./components/Resume');
const Editor = require('./components/Editor');

const appStyle = {
	fontFamily: "Roboto, sans-serif",
	margin: "0",
	padding: "0",
	WebkitFontSmoothing: "antialiased",
	fontSize: "13px"
}

const App = React.createClass({
	propTypes: {
		json: React.PropTypes.string.isRequired
	},
	getInitialState() {
		return {
			showEditor: false,
			resume: ResumeModel.getAll()
		};
	},
	toggleEditor() {
		this.setState({ showEditor: !this.state.showEditor });
	},
	_onChange() {
		const resume = ResumeModel.getAll();
		this.setState({ resume });
	},
	componentWillMount() {
		ResumeModel.addChangeListener(this._onChange);
		const order = ['basics', 'skills', 'work', 'education', 'volunteer', 'awards', 'publications', 'languages', 'interests', 'references']
		getResumeJSON(this.props.json)
			.then((resume) => {
				ResumeModel.new(Immutable.fromJS(resume).sortBy(
					(value, key) => key,
					(a, b) => order.indexOf(a) - order.indexOf(b)
				));
			})
			.catch((err) => console.error(err));
	},
	render() {
		const width = this.state.showEditor ? "50%" : "100%";
		const topCursor = Cursor.from(ResumeModel.getAll(), (newData, oldData, path) => {
			console.log(newData !== oldData);
			console.log(diff(oldData, newData).toJS());
			ResumeModel.new(newData);
		});
		return (
			<div style={appStyle}>
				{this.state.showEditor ?
					(<div style={{float: "left", width: "50%", minWidth: "200px", overflow: "scroll", overflowY: "scroll", height: "100%", background: "#282828" }}>
						<Editor
						data={this.state.resume}
						name="resume"
						cursor={topCursor}
						minEditDepth={1}
						minRemovalDepth={2}
						/>
					</div>) : ''}
				<div style={{float: "left", width: width, overflow: "scroll", height: "100%"}}>
					<Resume data={this.state.resume} onAppBarTouch={this.toggleEditor} />
				</div>
			</div>
		)
	}
});

window.ResumeInit = (url) => React.render(<App json={url} />, document.getElementById('app'));

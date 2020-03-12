import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class DownloadButton extends Component{
    render() {
        const props = this.props;
        const url = props.url;
        const filename = props.filename;

        return(
            <button><a href={url}>Download {filename}</a></button>
        )
    }
}

ReactDOM.render(<DownloadButton/>, document.getElementById("root"));

export default DownloadButton;
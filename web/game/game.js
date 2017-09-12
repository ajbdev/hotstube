import '../../src/style/layout.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Time from '../../src/ui/Time.js'

ReactDOM.render(<Time seconds={566} />, document.getElementsByTagName('body')[0])
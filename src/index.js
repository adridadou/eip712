import React from "react";
import ReactDOM from "react-dom";
import Erc712 from './erc712.js'

const Index = () => {
	const typeData = '[{"name":"_symbol","type":"string"},{"name":"_grantee","type":"address"},{"name":"_shares","type":"uint256"},{"name":"_start","type":"uint256"},{"name":"_end","type":"uint256"},{"name":"_tokensPerMonth","type":"uint256"}]';
	const message = '{"_symbol":"DAVID","_end":1559167200,"_grantee":"0x531e0957391dabf46f8a9609d799ffd067bdbbc0","_start":1558562400,"_tokensPerMonth":100,"_shares":1000}';

	const handleSubmit = () => {console.log(arguments)};

  return <div className="form-style-2">
  		<h2>Enter ERC-712 details</h2>
  	<Erc712 />
  </div>;
};

ReactDOM.render(<Index />, document.getElementById("index"));
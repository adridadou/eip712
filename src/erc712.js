import React from "react";
import ReactDOM from "react-dom";
import EIP712Domain from 'eth-typed-data';
import {SimpleSigner} from 'did-jwt';

export default class Erc712 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appName: 'OpenLaw',
      version: '2',
      verifyingContract: '0x733b258e3e8b24fbe158ca7e4a5231d5176fe90c',
      value: 'Please write an essay about your favorite DOM element.',
      salt: '0x10c9ae80dfd02ab6c80d11e5db1ca058b347eb26d86fa832cb1fbb68964323e7',
      typeName: 'CreateGrantCall',
      typeData: '[{"name":"_symbol","type":"string"},{"name":"_grantee","type":"address"},{"name":"_shares","type":"uint256"},{"name":"_start","type":"uint256"},{"name":"_end","type":"uint256"},{"name":"_tokensPerMonth","type":"uint256"}]',
      message: '{"_symbol":"DAVID","_end":1559167200,"_grantee":"0x531e0957391dabf46f8a9609d799ffd067bdbbc0","_start":1558562400,"_tokensPerMonth":100,"_shares":1000}',
      typeDefinition:'',
      privKey:''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setTypeData = this.setTypeData.bind(this);
    this.setMessage = this.setMessage.bind(this);
    this.tryToSign = this.tryToSign.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    
    const myDomain = new EIP712Domain({
      name: this.state.appName,               // Name of the domain
      version: this.state.version,                     // Version identifier for this domain
      chainId: 4,                       // EIP-155 Chain id associated with this domain (1 for mainnet)
      verifyingContract: this.state.verifyingContract,  // Address of smart contract associated with this domain
      salt: this.state.salt              // Random string to differentiate domain, just in case
    })

  const paramType = myDomain.createType(this.state.typeName, JSON.parse(this.state.typeData));
  const typeDefinition = `
  uint private constant chainId = 4;
  address private constant verifyingContract = ${this.state.verifyingContract};
  string private constant salt = ${this.state.salt};
  string private constant MY_TYPE = "${paramType.encodeType()}";
  bytes32 private constant MY_TYPEHASH = keccak256(abi.encodePacked(MY_TYPE));
  string private constant EIP712_DOMAIN  = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
  bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN));

  bytes32 private constant DOMAIN_SEPARATOR =  keccak256(abi.encode(
            EIP712_DOMAIN_TYPEHASH,
            keccak256("${this.state.appName}"),
            keccak256("${this.state.version}"),
            chainId,
            verifyingContract,
            salt
        ));
  }

  function hashParams(${this.state.typeName} memory params) private pure returns (bytes32){
        return keccak256(abi.encodePacked(
                "\\x19\\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(
                    MY_TYPEHASH,
                    keccak256(abi.encodePacked(call._symbol)),
                    call._grantee,
                    call._shares,
                    call._start,
                    call._end,
                    call._tokensPerMonth
                ))
            ));
    }
    `;
    this.setState({
      typeDefinition
    });

    event.preventDefault();
  }

  setTypeData(e) {
    try{
      const json = JSON.parse(e.target.value);
      const str = JSON.stringify(json, null, 2);
      this.setState({typeData:str});
      console.log(str);
    } catch (ex) {
      console.err(ex);
      this.setState({typeData:e.target.value});
    }  
  }

  setMessage(e) {
      try{
        const json = JSON.parse(e.target.value);
        const str = JSON.stringify(json, null, 2);
        this.setState({message:str});
        console.log(str);
      } catch (ex) {
        console.err(ex);
        this.setState({typeData:e.target.value});
      }  
    }

  tryToSign() {
    const signer = new SimpleSigner(this.state.privKey);
    const myDomain = new EIP712Domain({
      name: this.state.appName,
      version: this.state.version,
      chainId: 4,
      verifyingContract: this.state.verifyingContract,
      salt: this.state.salt              
    });

    const myType = myDomain.createType(this.state.typeName, JSON.parse(this.state.typeData));
    const myInstance = new myType(JSON.parse(this.state.message));
    const userAccount = web3.eth.accounts[0];
    web3.currentProvider.send('eth_signTypedData_v3', [userAccount, JSON.stringify(myInstance.toSignatureRequest())]).then(mmSignature => {
        myInstance.sign(signer).then(signature => {
          console.log(signer);
          console.log(mmSignature);
          console.log(signature.result);  
        });
    });
  }

  render() {
    return (
      <table style={{width:"100%"}}>
      <tbody>
      <tr>
      <td style={{verticalAlign:'top', width:"500px"}}>
        <label>Domain name: <input type="text" placeholder="name eg OpenLaw" defaultValue={this.state.appName} onChange={(e) => this.setState({appName:e.target.value})}></input></label>
        <label>ERC-712 version: <input type="text" placeholder="ERC-712 version" defaultValue={this.state.version} onChange={(e) => this.setState({version:e.target.value})}></input></label>
        <label>Verifying contract: <input type="text" placeholder="verifying contract address" defaultValue={this.state.verifyingContract} onChange={(e) => this.setState({verifyingContract:e.target.value})}></input></label>
        <label>Salt: <input style={{width:"300px"}} placeholder="salt value" type="text" defaultValue={this.state.salt} onChange={(e) => this.setState({salt:e.target.value})}></input></label>
        <label>type name: <input placeholder="type name" type="text" defaultValue={this.state.typeName} onChange={(e) => this.setState({typeName:e.target.value})}></input></label>
        <label>type data: <textarea cols="50" rows="10" value={this.state.typeData} onChange={this.setTypeData}></textarea></label>
        <label>message: <textarea cols="50" rows="10" value={this.state.message} onChange={this.setMessage}></textarea></label>
        <button onClick={this.tryToSign}>Click here to sign some typed data</button>
      </td>
      <td>
      type definition:<br/> <textarea value={this.state.typeDefinition} readOnly rows="100" cols="100"></textarea>
      </td></tr>
      </tbody>
      </table>
    );
  }
}
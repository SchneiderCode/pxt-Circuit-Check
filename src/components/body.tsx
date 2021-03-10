import * as React from "react";
import { PXTComponentProps } from "../PXTExtension";
import { IApp } from "../App";

export interface BodyProps extends PXTComponentProps {
    parent: IApp;
}

export class Body extends React.Component<BodyProps> {

    constructor(props: BodyProps) {
        super(props);

        this.handleCodeChange = this.handleCodeChange.bind(this);
    }

    handleCodeChange() {
        const value = document.getElementById("code_area").innerText.toString();
        this.props.parent.setUserFiles({ code: value })
    }

    render(): JSX.Element {
        const { code, json, jres, asm } = this.props;
        // TODO update display
        return <div>
            <p id="code_area" contentEditable={true} >{code} </p>
            <button onClick={() =>{this.handleCodeChange()}}>Update Code</button>
        </div>; 
    }
}

import * as React from "react";
import { pxt, PXTClient } from "../../lib/pxtextensions";

export interface DataStreamProps {
    client: PXTClient;
    hosted: boolean;
}

export interface DataStreamState {
    streaming?: boolean;
}

export class DataStream extends React.Component<DataStreamProps, DataStreamState> {

    constructor(props: DataStreamProps) {
        super(props);

        this.state = {

        };
        this.handleStart = this.handleStart.bind(this);
        this.props.client.on("datastream", streaming => this.setState({ streaming }));
    }

    private handleStart() {
        pxt.extensions.dataStream(true);
    }

    render(): JSX.Element {
        const hosted = true;//{ hosted } = this.props;
        const { streaming } = this.state;
        return <div>
                    <h3>Serial Data</h3>
                    <pre className="ui tiny">waiting for data</pre>
                    <button onClick={this.handleStart}>
                        {streaming ? "Stop streaming" : "Start streaming"}
                    </button>
                </div>;
    }
}

import { useEffect, useRef } from "react";
import embed, { vega } from 'vega-embed';


interface ReactVegaProps {
    content: any;
    dataset?: any;
}

const Visualization: React.FC<ReactVegaProps> = ({ content, dataset }) => {

    const spec :any = JSON.parse(content);
    const data=JSON.parse(dataset);

    const container = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (container.current && data) {
            spec.data = {
                name: 'dataSource'
            }
            spec.width = 700; // Replace with your desired width
            spec.height = 400;
            embed(container.current, spec, { actions: false }).then(res => {
                res.view.change('dataSource', vega.changeset().remove(() => true).insert(data))
                res.view.resize();
                res.view.runAsync();
            })
        }
    }, [spec, data])
    return <div ref={container}></div>
};

export default Visualization;
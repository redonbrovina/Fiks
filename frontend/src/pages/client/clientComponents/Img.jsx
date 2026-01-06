export default function Img({classNaming, imgSource, description}) {
    return (
             <div className={classNaming}>
                        <img src={imgSource} alt="" />
                        <p>{description}</p>
                    </div>
    );
}
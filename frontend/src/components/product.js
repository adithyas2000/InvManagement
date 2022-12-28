import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

const ProductCard = (props) => {
    const prodName=props.prodName;
    const prodPrice=props.prodPrice;
    const prodId=props.prodId;
    
    const backend = "http://localhost:5000";

    const prodButton=props.prodButton;
    const delButton=props.delButton;

    const onClickHandler=(e)=>{
        e.preventDefault();
        console.log("Edit prod "+prodName);
    }
    return (
        <Card style={{ width: '18rem' }}>
            <Card.Img variant="top" src={`${backend}/images/?prod=${prodName}`} />
            <Card.Body>
                <Card.Title>{prodName?prodName:"Undefined"}</Card.Title>
                <Card.Text>
                    {prodPrice?prodPrice:"Undefined"}
                </Card.Text>
                {prodButton?<Button id={prodId} onClick={e=>{prodButton?prodButton(e):onClickHandler(e)}} variant="primary">Edit Product</Button>:""}
                {delButton?<Button id={prodId} onClick={e=>{delButton?delButton(e):onClickHandler(e)}} variant="danger">Remove Product</Button>:""}
            </Card.Body>
        </Card>
    );
}

export default ProductCard;
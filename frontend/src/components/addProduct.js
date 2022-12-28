import axios from 'axios';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const AddProduct = () => {

    const [catArray, setCatArray] = useState([]);
    const [image, setImage] = useState();
    const [file, setFile] = useState();
    const [prodName,setProdName]=useState("");
    const [prodPrice,setProdPrice]=useState(0);
    const [prodCats,setProdCats]=useState({});
    const backend = "http://localhost:5000";

    const getCats = () => {
        axios.get(backend + '/getAllCats')
            .then(res => {
                console.table(res.data);
                const rowWidth = 4;
                var tempArray = [];
                var tempGrid = [];
                res.data.forEach(cat => {
                    tempArray.push(<Col key={cat._id}><Form.Check
                        inline
                        label={cat.name}
                        name="catGroup"
                        type='checkbox'
                        data-index={res.data.indexOf(cat)}
                        id={cat._id}
                        onChange={e=>handleCatSelection(e.target.checked,e.target.id)}
                    /></Col>)
                });
                var tempSection = [];
                tempArray.forEach(col => {
                    if (((tempArray.indexOf(col) + 1) % rowWidth !== 0) && (tempArray.indexOf(col) + 1 !== tempArray.length)) {
                        tempSection.push(col);
                    } else {
                        tempSection.push(col);
                        tempGrid.push(<Row key={tempArray.indexOf(col)}>{tempSection}</Row>);
                        tempSection = [];
                    }
                });
                // tempGrid.push(<Row>{tempArray}</Row>);
                setCatArray(tempGrid);
            })
            .catch(err => {
                console.error(err);
            });
    };

    const handleCatSelection=(state,id)=>{
        // debugger;
        var tempObj=prodCats;
        tempObj[id]=state;
        setProdCats({...tempObj});
    };

    const handleFileChange = (e) => {
        console.log(e.target.files[0]);
        setFile(e.target.files[0]);

    };

    const createProduct = (e) => {
        var cats=prodCats;
        var productCats=[];
        Object.entries(cats).forEach(cat=>{
            if(cat[1]===true){
                productCats.push(cat[0]);
            }else{
                console.log(`Skipped ${cat[0]}`);
            }
            console.table(productCats);
        });

        var prodForm=new FormData();
        prodForm.append('file',file);
        prodForm.append('prodName',prodName);
        prodForm.append('prodPrice',prodPrice);
        prodForm.append('prodCats',JSON.stringify(productCats));

        axios.post(backend+'/newProd',prodForm)
        .then(res=>{
            console.log(res.data);
            window.location.reload();
        })
        .catch(err=>{
            console.error(err);
        })
        console.log(`Create product ${prodName} with price ${prodPrice}`);
    };

    const clearFile=(e)=>{
        e.preventDefault();
        setFile();
        setImage();
    };

    // useEffect(()=>{
    //     console.log("numCats changed");
    //     console.log(numCats);
    //     var tarr=[];
    //     tarr.length=numCats;
    //     console.log(tarr.length);
    //     setProdCats(tarr);
    // },[numCats]);

    useEffect(()=>{
        console.log("Prodcats changed");
        console.table(prodCats);
    },[prodCats]);

    useEffect(() => {
        if (file) {
            console.log("Using file reader");
            const fr = new FileReader();

            fr.onload = (e => setImage(e.target.result))
            fr.readAsDataURL(file);
            // setImage(fr.result);
        }

    }, [file]);


    useEffect(() => {
        getCats();
        
    }, []);

    return (
        <div className='mainContainer'>
            <Form>
                <Form.Group className="mb-3" controlId="prodName">
                    <Form.Label>Product name</Form.Label>
                    <Form.Control type="text" placeholder="Product name" onChange={e=>setProdName(e.target.value)}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="prodPrice">
                    <Form.Label>Product name</Form.Label>
                    <Form.Control type="number" placeholder="00" onChange={e=>setProdPrice(e.target.value)}/>
                </Form.Group>


                <Form.Group className="mb-3" controlId="prodImage">
                    <Form.Label>Product image</Form.Label>
                    <Form.Control type="file" size="sm" accept='.jpg' onChange={e => { e.preventDefault(); handleFileChange(e); }} />
                </Form.Group>
                <div className='prodImage'>
                {image?<img alt='Product' className='prodImage' src={image} />:""}
                {image?<Button onClick={e=>clearFile(e)} >Clear file</Button>:""}
                </div>
                <Form.Text>Select categories:</Form.Text>
                {/* Category grid */}
                <Container>
                    {catArray}
                </Container>


                <Button onClick={e => { e.preventDefault(); createProduct(e); }} variant="primary" type="submit">
                    Submit
                </Button>
            </Form>

        </div>
    );

}
export default AddProduct;
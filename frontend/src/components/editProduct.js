import axios from 'axios';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'; import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useParams } from 'react-router-dom';

const EditProduct=()=>{
    const [catArray, setCatArray] = useState([]);
    const [image, setImage] = useState();
    const [file, setFile] = useState();
    const [prodName,setProdName]=useState("");
    const [prodPrice,setProdPrice]=useState(0);
    const [prodCats,setProdCats]=useState({});
    const backend = "http://localhost:5000";
    const params=useParams();
    const id=params.id;
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
                    if (((tempArray.indexOf(col) + 1) % rowWidth != 0) && (tempArray.indexOf(col) + 1 != tempArray.length)) {
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

    useEffect(() => {
        getCats();
        getProdData();
    }, []);

    useEffect(() => {
        if (file) {
            console.log("Using file reader");
            const fr = new FileReader();

            fr.onload = (e => setImage(e.target.result))
            fr.readAsDataURL(file);
            // setImage(fr.result);
        }

    }, [file]);

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

    const editProduct = (e) => {
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
        prodForm.append('editId',id);
        prodForm.append('file',file);
        prodForm.append('prodName',prodName);
        prodForm.append('prodPrice',prodPrice);
        prodForm.append('prodCats',JSON.stringify(productCats));

        axios.post(backend+'/editProd',prodForm)
        .then(res=>{
            console.log(res.data);
            window.location.href='/categories';
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

    const getProdData=async ()=>{
        console.log(`ID: ${id}`);
        await axios.get(backend+'/getProd',{params:{"id":id}})
        .then(async res=>{
            console.log("Data of editing prod:");
            console.table(res.data);
            setProdName(res.data.prodName);
            setProdPrice(res.data.prodPrice);
            // await axios.get(backend+'/images?prod='+res.data.prodName)
            // .then(img=>{
            //     setFile(img);
            // })
            // .catch(err=>{
            //     console.log("Error getting image");
            //     console.error(err);
            // })
            setImage(`${backend}/images/?prod=${res.data.prodName}`);
        })
        .catch(err=>{
            console.log("Error getting data of editing prod");
            console.error(err);
        })
    }
    return(
        <div className='mainContainer'>
            <Form>
                <Form.Group className="mb-3" controlId="prodName">
                    <Form.Label>Product name</Form.Label>
                    <Form.Control type="text" value={prodName} placeholder="Product name" onChange={e=>setProdName(e.target.value)}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="prodPrice">
                    <Form.Label>Product price</Form.Label>
                    <Form.Control type="number" value={prodPrice} placeholder="00" onChange={e=>setProdPrice(e.target.value)}/>
                </Form.Group>


                <Form.Group className="mb-3" controlId="prodImage">
                    <Form.Label>Product image</Form.Label>
                    <Form.Control type="file" size="sm" accept='.jpg' onChange={e => { e.preventDefault(); handleFileChange(e); }} />
                </Form.Group>
                <div className='prodImage'>
                <img className='prodImage' src={image} />
                {image?<Button onClick={e=>clearFile(e)} >Clear file</Button>:""}
                </div>
                <Form.Text>Select categories:</Form.Text>
                {/* Category grid */}
                <Container>
                    {catArray}
                </Container>


                <Button onClick={e => { e.preventDefault(); editProduct(e); }} variant="primary" type="submit">
                    Submit
                </Button>
            </Form>


        {prodCats.length}
        </div>
    )
}

export default EditProduct;
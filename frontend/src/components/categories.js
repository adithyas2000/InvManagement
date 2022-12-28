import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ProductCard from "./product";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';



const Categories = (props) => {

    const backend = "http://localhost:5000";
    const params = useParams();
    const [catNameList, setCatNameList] = useState();
    const [currentCat, setCurrentCat] = useState("");
    const [upLink, setUpLink] = useState("");
    const [newCatName, setNewCatName] = useState("");

    const gridWidth=4;

    const [prods, setProds] = useState([]);
    var id = 0;

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        console.log("Prods updated");
        console.table(prods);
    }, [prods]);

    const getData = async () => {
        //Load categories
        setNewCatName("");
        if (params.level && params.id) {
            id = params.id;
            await axios.get(backend + '/getCats', { params: { "level": params.level, "id": params.id } })
                .then(async res => {
                    const parent = res.data[0];
                    setCurrentCat(parent.name);
                    // debugger;
                    if (Number(parent.level === 0)) {
                        setUpLink(`/categories`);
                    } else {
                        setUpLink(`/categories/${Number(parent.level) - 1}/${parent.parent}`);
                    }
                    console.log("Res data:");
                    console.log(res.data);

                    var catNames = [];

                    await res.data[1].forEach(cat => {
                        console.log("cat:");
                        console.log(cat);
                        var catLEngth = catNames.push(<h6 key={cat._id}><a href={`/categories/${cat.level}/${cat._id}`}>{cat.name}</a>&emsp;<a data-name={cat.name} style={{ cursor: 'pointer' }} id={cat._id} onClick={(e) => { deleteHandler(e.target.id, e.target.getAttribute('data-name')); }}>🗑</a></h6>);
                        // debugger;
                        console.log(`Cat length: ${catLEngth}`);
                    });
                    setCatNameList(catNames)

                })
                .catch(err => {
                    console.error(err);
                });

            await getProducts(id);
        } else {
            await axios.get(backend + '/getBaseCats')
                .then(async res => {
                    setCurrentCat("Main");
                    var catNames = [];
                    // console.log(res.data);
                    await res.data.forEach(cat => {
                        console.log("cat:");
                        console.log(cat);
                        var catLength = catNames.push(<h6 key={cat._id}><a href={`/categories/${cat.level}/${cat._id}`}>{cat.name}</a>&emsp;<a data-name={cat.name} style={{ cursor: 'pointer' }} id={cat._id} onClick={(e) => { deleteHandler(e.target.id, e.target.getAttribute('data-name')); }}>🗑</a></h6>);
                        // debugger;
                        console.log(`Cat length: ${catLength}`);
                    });
                    setCatNameList(catNames)
                })
                .catch(err => {
                    console.error(err);
                });
            console.log("Cat names:");
            console.log(catNameList);

            await getProducts('main');
        };

    };

    const getProducts = async (category) => {
        await axios.get(backend + '/getAllProds')
            .then(res => {
                var tempProds = [];
                console.log("Product res:");
                console.table(res.data);

                res.data.forEach(prod => {
                    var valid = false;
                    prod.prodCats.forEach(cat => {
                        if (cat === category) {
                            valid = true;
                        };
                    });
                    if (valid && category !== 'main') {
                        tempProds.push(<Col key={prod._id}>{MakeProdCard(prod.prodName, prod.prodPrice,gotoProdEdit, prod._id, removeProd)}</Col>);
                    } else if (category === 'main') {
                        tempProds.push(<Col key={prod._id}>{MakeProdCard(prod.prodName, prod.prodPrice, gotoProdEdit, prod._id, removeProd)}</Col>);
                    }

                });
                var productArray=[];
                var tempSection=[];
                tempProds.forEach(prod => {
                    // console.log("Prod:");
                    // console.table(prod);
                    
                    if((tempProds.indexOf(prod)+1)%gridWidth!==0 && (tempProds.indexOf(prod)+1)!==tempProds.length){
                        tempSection.push(prod);
                    }else{
                        tempSection.push(prod);
                        productArray.push(<Row key={tempProds.indexOf(prod)}>{prod.prodId}{tempSection}</Row>)
                        tempSection=[];
                    }
                });
                setProds(productArray);
            })
            .catch(err => {
                console.error(err);
            });
    };

    const MakeProdCard = (prodName, prodPrice, prodButton, prodId, delButton) => {
        return (
            <ProductCard prodName={prodName} prodPrice={prodPrice} prodButton={(e) => prodButton(e)} prodId={prodId} delButton={delButton} />
        )
    }

    const deleteHandler = (deleteId, name) => {
        var confirmDel = window.confirm(`Are you sure you want to delete this category: ${name}?`);
        if (confirmDel) {
            const delData = { "id": deleteId };
            axios.post(backend + '/deleteCat', delData)
                .then(res => {
                    console.log(res.data);
                    getData();
                })
                .catch(err => {
                    console.log("Error at delete cat");
                    console.error(err);
                });
            console.log(deleteId);
        }


    }

    const handleClick = (id) => {

        // console.log(`Button click ${id} - new category:${newCatName}`);
        if ((newCatName.trim())) {
            console.log(`New category:${newCatName}`);
            if (id) {
                console.log(`Button click ${id}`);
                newCategory(id, newCatName);
            } else {
                console.log("Base class");
                newCategory(null, newCatName);
            }
        } else {
            console.log("No cat name");
        }
        setNewCatName("");
    };

    const newCategory = (parentId, newName) => {
        axios.post(backend + '/newCat', { "parentId": parentId, "newName": newName })
            .then(res => {
                console.log(res);
                getData();
            })
            .catch(err => {
                console.log(err);
            });
    };

    const gotoProdEdit = (e) => {
        e.preventDefault();
        console.log(e.target.id);
        window.location.href='/editProduct/'+e.target.id;
    };

    const removeProd = async (e) => {
        var confirm = window.confirm("Are you sure you want to remove this product?");
        if (confirm) {
            console.log("Remove " + e.target.id);
            const delFilter = { "delId": e.target.id };
            await axios.post(backend + '/deleteProd', delFilter)
                .then(async res => {
                    console.log(res.data);
                    await getData();
                })
                .catch(err => {
                    console.error(err);
                })
        }

    }

    // console.log(params);
    //If no category level specified, get top level categories

    return (
        <div className="mainContainer">
            {params.id && params.level ? <a href={upLink}><h4>◀Back</h4></a> : <></>}
            <h3>{currentCat}</h3>
            <>{catNameList}</>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>New category name:</Form.Label>
                    <Form.Control required type="text" placeholder="Enter name" value={newCatName} onChange={e => { setNewCatName(e.target.value); }} />
                </Form.Group>
                <Button type="submit" onClick={(e) => { e.preventDefault(); handleClick(params.id); }}>Add new</Button>
            </Form>
        <Container>
            {prods}
        </Container>
            
        </div>
    )
}

export default Categories;
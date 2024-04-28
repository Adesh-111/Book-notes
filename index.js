import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

const db = new pg.Client({
    user : "postgres",
    host : "localhost",
    database : "Books",
    password : "adeshabin1251",
});

db.connect();

let books = [];

app.get("/" ,async (req,res) =>{
    const result = await db.query("select * from book_info bi join book_isbn bis on bi.id = bis.book_id JOIN book_notes bn ON bi.id = bn.book_id;");
    books = result.rows;
    res.render("index.ejs",({
        books : books,
    }));
});

app.get("/notes", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM book_info bi JOIN book_isbn bis ON bi.id = bis.book_id JOIN book_notes bn ON bi.id = bn.book_id;");
        const id = req.query.id;
        const books = result.rows;
        const findBook = books.find((book) => book.id == id);
        res.render("notes.ejs", {
            book: findBook,
            books: books
        });
    } catch (error) {
        console.error("Error retrieving data from the database:", error);
        res.status(500).send("An error occurred while retrieving data from the database.");
    }
});

app.post("/update",async (req,res)=>{
    const updateId = req.body.updateId;
    const updateNotes = req.body.notes;
    const result = await db.query("update book_notes set notes = $1 where id= $2",[updateNotes,updateId]);
    res.redirect("/");
});

app.post("/newbook", async (req,res) =>{
    const data = req.body;
    const title = data. booktitle;
    const author = data.bookAuthor;
    const dateRead = data.dateInput;
    const ISBN = data.bookISBN;
    const description = data.description;
    const rating = data.bookRating;
    const notes = data.bookNotes;
    const result = await db.query("insert into book_info (date_read,title,description,author) values($1,$2,$3,$4)",[dateRead,title,description,author]);
    const forId = await db.query("select id from book_info order by id desc");
    const ID = forId.rows[0].id;
    const result2 = await db.query("insert into book_isbn (book_isbn,book_id) values ($1,$2)",[ISBN,ID]);
    const result3 = await db.query("insert into book_notes(rating,notes,book_id) values ($1,$2,$3)",[rating,notes,ID]);
    res.redirect("/");
});


app.post("/delete", async (req, res) => {
    const deleteItemId = req.body.deleteId;
    await db.query("DELETE FROM book_notes WHERE book_id = $1", [deleteItemId]);
    await db.query("DELETE FROM book_isbn WHERE book_id = $1", [deleteItemId]);
    await db.query("DELETE FROM book_info WHERE id = $1", [deleteItemId]);
    res.redirect("/");
});

app.get("/new", (req,res) =>{
    res.render("new.ejs");
});

app.listen( port, (req,res)=> {
    console.log(`Server is listening on http://localhost:${port}`);
});
Manatee is a single-file, drop-in database migrator for ASP.NET/WebMatrix using .NET 4.0
=================================================================================================

If you know Rails, you know about Migrations. If you don't know Rails you'll be wondering why you would want to use this thing. The short answer is that it allows you to change your database over time - adding tables, changing columns, etc.

It's true that you can just use the designer - and if that works for you then rock on! In the Rails world it's common to develop in SQLite and move to MySQL or PostgreSQL in the future. The schema declarations for each of these systems differs - and makes people sad.

Migrations help with this. It's conceivable that you might want to use SQL CE to develop with - but at some point push to SQL Server. You can do that with this little migrator quite easily - and you can also push incremental changes to your production box when you make them (just be sure to lock down this page so people can't mess with it.)


How To Install It?
------------------
Drop the code file into your app and change it as you wish. By default the file wants to sit in the `~/DB` directory with your migration files sitting in `~/DB/Migrations`. But you can change all of this if you like.

How Do You Use It?
------------------
It works with JSON and before you think "puke" - JSON can be used as a bit of a DSL/script that reads rather nicely. If you can write an anonymous object in C#, you can write JSON. Get over it.

The simplest thing to do is call your DDL directly:

    {
        up: "CREATE TABLE Orders (ID {pk}, OrderNumber {string} NOT NULL, SubTotal {money})",
        down: "DROP TABLE Orders"
    }
	
Some people like SQL. I like SQL. And then some don't. That's OK - if you're in the latter camp I'll help you in a second. In this example I've just told SQL to create a table for an "up" operation - a "version up" if you will. In there I have some replacement strings that will get replaced with the default values I like. `string` is `varchar(255)`, `money` is `decimal(8,2)`, `pk` is `int NOT NULL IDENTITY(1,1) PRIMARY KEY`. You get the idea.

Note that this JSON object describes what to do on an "up" call, and it's exact opposite is run on the "down" call. You don't have to do this if you use the JSON bits below. If you go straight SQL, you do.

Each of the JSON examples below is part of a single file. Ideally you will do a single operation per file (it's what the Rails guys do and it's made sense to me over time). The files are sorted in a SortedDictionary by key - and that key is a file name so it has to be something sortable. One thing you can do is a format like `YEAR_MONTH_DAY_TIME_description.js`. So this might, in reality, look like `2011_04_21_1352_create_products.js`. It's wordy, but it provides some nice meta data.

The next simplest thing to do is to specify a few things with some more structure:

    {
        up: {
            create_table: {
                name: "categories",
                timestamps: true,
                columns: [
                    { name: "title", type: "string" },
                    { name: "description", type: "text" }
                ]
            }
        }
    }

In this example I'm using structured JSON - setting the table name and the columns (which need to be an array). JSON can be tricky for some people - but it's just the same as C# anonymous object declaration and after you do it once or twice you'll dig it.

The datatypes used here are the same shorthand as the SQL call above - string will be converted the same way (as will money, text, boolean, and so on). Also - a bit of sweetness thrown in - if you want to have "audit" columns you can by setting `timestamps` to true. This will drop in two columns: "CreatedOn" and "UpdatedOn" that you should update when saving your data.

Finally - notice that there's no primary key defined? I meant to  - and sometimes we forget these things. I won't let you  - if you forget a PK it will automatically added for you (and called "Id").
	
Note that there is no "down" declared here. Create table has a pretty understandable reverse - "DROP TABLE" and we can infer that from this code. If you want to specify a "down" - go for it - that would look like this:

    {
        up: {
            create_table: {
                name: "products",
                columns: [
                    { name: "title", type: "string" },
                    { name: "description", type: "string" },
                    { name: "price", type: "money" }
                ]
            },
            execute: "INSERT INTO products(title, description, price) VALUES('test', 'lorem ipsum', 12.00);"
        },
        down: {
            drop_table: "products"
        }
    }

It helps to be explicit - less magic and all. If you're using this on a team you might consider leaving the downs declared so that people who might not know how to work this can follow along better.
Also - sometimes it's helpful to add some data or run some clean up stuff. Maybe add a foreign key or an index - that's what "execute" does. It will run after everything else is finished and you can drop that in up or down.

Once you're up and running with your new tables, you'll likely want to change them. You can do that by adding a column:

    {
        up: {
            add_column: {
                table: "categories",
                columns: [
                    { name: "slug", type: "string" }
                ]
            }
        },
        down: {
            remove_column: {
                table: "categories",
                name: "slug"
            }
        }
    }
	
Note the reverse here uses "remove_column". If you use Rails you might recognize these names :). You can also modify an existing column if you like:

    {
        up: {
            change_column: {
                table: "categories",
                columns: [
                    { name: "slug", type: "boolean" }
                ]
            }
        },
        down: {
            change_column: {
                table: "categories",
                columns: [
                    { name: "slug", type: "string" }
                ]
            }
        }
    }
	

To add indexes to your tables just specify the tables and the columns you want included in the index. The name will be generated for you by convention.
The down definition is optional as well.  It will be handled if you don't include it.

    {
        'up':{
            add_index:{
                table_name:"categories",
                columns:[
                    "title",
                    "slug"
                 ]
            }
        },
        'down':{
            remove_index:{
                table_name:"categories",
                columns:[
                    "title",
                    "slug"
                 ]
            }
        }
    }
And that's just about it. To run this thing - just run the code (migrate.cshtml) and up will pop your page. It will try and read the files in your `~/DB/Migrations` directory and it will tell you what to do next.

If you see any weirdness - lemme know!
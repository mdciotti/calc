/* CAS.js Parser
 * Description:
 * Parses mathematical expressions in LaTeX
 * and returns a parse tree.
 */

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
\$[^\$]*\$            return 'TEXT'
"\left("              return '('
"\right)"             return ')'
"\frac"               return 'FRAC'
"\sqrt"               return 'SQRT'
"\cdot"               return '*'
"\times"              return '*'
"\div"                return '/'
"\leq"                return 'LE'
"\geq"                return 'GE'
"\neq"                return 'NE'
\\[a-zA-Z]+           return 'CMD'
[a-zA-Z]+             return 'IDENT'
[a-zA-Z]              return 'VAR'
[0-9]+\.[0-9]*        return 'FLOAT'
[0-9]+                return 'INT'
"="                   return '='
"<"                   return '<'
">"                   return '>'
"*"                   return '*'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"!"                   return '!'
/*\_[^\(\{]             return '_'
/*\^[^\(\{]             return '^'*/
"_"                   return 'SUB'
"^"                   return 'POW'
"{"                   return '{'
"}"                   return '}'
"("                   return '('
")"                   return ')'
"["                   return '['
"]"                   return ']'
","                   return ','
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

/* operator associations and precedence */

%left '<' '>' '=' NE LE GE
%left '+' '-'
%left '*' '/'
%left '^' POW SUB
%left UMINUS
%left BDEFAULT

%start Statement

%% /* language grammar */

Statement
    : Expr EOF                    {return $1;}
    | Relation EOF                {return $1;}
    ;

Relation
    : Expr '=' Expr                  {$$ = ['=', $1, $3];}
    | Expr NE Expr                   {$$ = ['!=', $1, $3];}
    | Expr LE Expr                   {$$ = ['<=', $1, $3];}
    | Expr '<' Expr                  {$$ = ['<', $1, $3];}
    | Expr '>' Expr                  {$$ = ['>', $1, $3];}
    | Expr GE Expr                   {$$ = ['>=', $1, $3];}
    ;
/*
List
    : List ',' List            {$$ = [',', $1, $3];}
    | List ',' Expr            {$$ = [',', $1, $3];}
    ;

Vector
    : '(' List ')'             {$$ = $2;}
    ;
*/
Expr
    : Expr '+' Expr                    {$$ = ['+', $1, $3];}
    | Expr '-' Expr                    {$$ = ['-', $1, $3];}
    | Expr '*' Expr                    {$$ = ['*', $1, $3];}
    | Expr '/' Expr                    {$$ = ['/', $1, $3];}
    /*| Expr Cmd Expr                    {$$ = [$2, $1, $3];}/*
    /*| Expr '!'                         {$$ = ['!', $1];}*/
    | '-' Expr %prec UMINUS            {$$ = ['neg', $2];}
    | SQRT '{' Expr '}'                {$$ = ['sqrt', $3];}
    | SQRT '[' Expr ']' '{' Expr '}'   {$$ = ['root', $3, $6];}
    | FRAC '{' Expr '}' '{' Expr '}'   {$$ = ['frac', $3, $6];}
    | Expr POW Single                  {$$ = ['^', $1, $3];}
    | Expr POW '{' Expr '}'            {$$ = ['^', $1, $4];}
    | Expr SUB Single                  {$$ = ['_', $1, $3];}
    | Expr SUB '{' Expr '}'            {$$ = ['_', $1, $4];}
    | Expr Expr %prec BDEFAULT         {$$ = ['*', $1, $2];}
    | '|' Expr '|'                     {$$ = ['abs', $2];}
    | '(' Expr ')'                     {$$ = $2;}
    /*| Vector                           {$$ = $1;}*/
    | Identifier                       {$$ = $1;}
    | Number                           {$$ = $1;}
    ;

Cmd
    : CMD                              {$$ = yytext.substring(1);}
    ;

/*
InfixBinaryOperator
    : '+'                      {$$ = $1;}
    | '-'                      {$$ = $1;}
    | '*'                      {$$ = $1;}
    | '/'                      {$$ = $1;}
    | '^'                      {$$ = $1;}
    | CMD                      {$$ = yytext.substring(1);}
    ;
/*
Block
    : BEGIN '{' IDENTIFIER '}' SourceElements END '{' IDENTIFIER '}'
    ;

SourceElements
    : SourceElement
    | SourceElements SourceElement
    ;

SourceElement
    : 
    ;
*/

Single
    : VAR                      {$$ = yytext;}
    | Number                   {$$ = $1;}
    ;

Identifier
    : VAR                      {$$ = yytext;}
    | IDENT                    {$$ = yytext;}
    ;

Number
    : FLOAT                    {$$ = parseFloat(yytext);}
    | INT                      {$$ = parseInt(yytext);}
    ;

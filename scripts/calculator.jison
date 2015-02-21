/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
[0-9]+("."([0-9]+\b)?)?  return 'NUMBER'
"*"                   return '*'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"^"                   return '^'
"("                   return '('
")"                   return ')'
"|"                   return '|'
"pi"                  return 'PI'
"e"                   return 'E'
"e^("                 return 'EXP'
"int("                return 'INT'
"sqrt("               return 'SQRT'
"log("                return 'LOG'
"ln("                 return 'LN'
"sin("                return 'SIN'
"cos("                return 'COS'
"tan("                return 'TAN'
"asin("               return 'ASIN'
"acos("               return 'ACOS'
"atan("               return 'ATAN'
"csc("                return 'CSC'
"sec("                return 'SEC'
"cot("                return 'COT'
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

/* operator associations and precedence */

%left '+' '-'
%left '*' '/'
%left '^'
%left UMINUS

%start expressions

%% /* language grammar */

expressions
    : e EOF
        {return $1;}
    ;

e
    : e '+' e
        {$$ = $1+$3;}
    | e '-' e
        {$$ = $1-$3;}
    | e '*' e
        {$$ = $1*$3;}
    | e '/' e
        {$$ = $1/$3;}
    | e '^' e
        {$$ = Math.pow($1, $3);}
    | '-' e %prec UMINUS
        {$$ = -$2;}
    | 'EXP' e ')'
        {$$ = Math.exp($2);}
    | 'INT' e ')'
        {$$ = Math.floor($2);}
    | 'SQRT' e ')'
        {$$ = Math.sqrt($2);}
    | 'LOG' e ')'
        {$$ = Math.log($2) / Math.log(10);}
    | 'LN' e ')'
        {$$ = Math.log($2);}
    | 'SIN' e ')'
        {$$ = Math.sin($2);}
    | 'COS' e ')'
        {$$ = Math.cos($2);}
    | 'TAN' e ')'
        {$$ = Math.tan($2);}
    | 'ASIN' e ')'
        {$$ = Math.asin($2);}
    | 'ACOS' e ')'
        {$$ = Math.acos($2);}
    | 'ATAN' e ')'
        {$$ = Math.atan($2);}
    | 'CSC' e ')'
        {$$ = 1/Math.sin($2);}
    | 'SEC' e ')'
        {$$ = 1/Math.cos($2);}
    | 'COT' e ')'
        {$$ = 1/Math.tan($2);}
    | '|' e '|'
        {$$ = Math.abs($2);}
    | '(' e ')'
        {$$ = $2;}
    | NUMBER
        {$$ = Number(yytext);}
    | E
        {$$ = Math.E;}
    | PI
        {$$ = Math.PI;}
    ;

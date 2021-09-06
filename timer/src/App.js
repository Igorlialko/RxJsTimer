import React from 'react'
import {interval,Subject,takeUntil} from "rxjs";
import {useEffect, useState,useCallback} from "react";
import useClickPreventionOnDoubleClick from "./useClickPreventionOnDoubleClick";


 function App() {
    const [sec, setSec] = useState(0);
    const [status, setStatus] = useState("stop");

    useEffect(() => {
        const unsubscribe$ = new Subject();
        interval(1000)
            .pipe(takeUntil(unsubscribe$))
            .subscribe(() => {
                if (status === "start") {
                    setSec(val => val + 1000);
                }
            });
        return () => {
            unsubscribe$.next();
            unsubscribe$.complete();
        };
    }, [status]);

    const startStop = useCallback(() => {
       if(status!=="start"){setStatus("start")}else{setStatus("stop");setSec(0)}
    }, [status]);

    const reset = useCallback(() => {
        setSec(0);
        setStatus("start");
    }, []);

    const wait = useCallback(() => {
        setStatus("wait");
        console.log("on double click")
    }, []);
     const [handleClick, handleDoubleClick] = useClickPreventionOnDoubleClick(() => console.log("on click"), wait);

     return (
        <div>
           <div>
               <h1> {new Date(sec).toISOString().slice(11, 19)}</h1>
           </div>
        <div>
            <button  onClick={startStop}>
                Start/Stop
            </button>
            <button onClick={handleClick} onDoubleClick={handleDoubleClick}>
            Wait</button>
            <button onClick={reset}>Reset</button>
        </div>
        </div>
    );
}

export default App;

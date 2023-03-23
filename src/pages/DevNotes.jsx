import React, {useEffect} from 'react';

const DevNotes = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <div className="container">
            <div className="row d-flex justify-content-center">
                <div className="col-md-12 text-center">
                    <h1 className="display-1"> Version 1.0</h1>
                </div>

                <div className="col-md-9">
                    <h1 className="display-2">Updates to come:</h1>
                    <h1 className="display-6">>Search functionality.</h1>
                    <h1 className="display-6">>Filter by product categories</h1>
                </div>

            </div>
        </div>
    );
};

export default DevNotes;
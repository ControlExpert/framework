﻿using Signum.Entities;
using Signum.Entities.Dynamic;
using System;
using Microsoft.AspNetCore.Mvc;
using Signum.React.Filters;
using System.ComponentModel.DataAnnotations;

namespace Signum.React.Dynamic
{
    [ValidateModelFilter]
    public class DynamicTypeConditionController : ControllerBase
    {
        [HttpPost("api/dynamic/typeCondition/test")]
        public DynamicTypeConditionTestResponse Test([Required, FromBody]DynamicTypeConditionTestRequest request)
        {
            IDynamicTypeConditionEvaluator evaluator;
            try
            {
                evaluator = request.dynamicTypeCondition.Eval.Algorithm;
            }
            catch(Exception e)
            {
                return new DynamicTypeConditionTestResponse
                {
                    compileError = e.Message
                };
            }

            try
            {
                return new DynamicTypeConditionTestResponse
                {
                    validationResult = evaluator.EvaluateUntyped(request.exampleEntity)
                };
            }
            catch (Exception e)
            {
                return new DynamicTypeConditionTestResponse
                {
                    validationException = e.Message
                };
            }
        }

        public class DynamicTypeConditionTestRequest
        {
            public DynamicTypeConditionEntity dynamicTypeCondition;
            public Entity exampleEntity;
        }

        public class DynamicTypeConditionTestResponse
        {
            public string compileError;
            public string validationException;
            public bool validationResult;
        }
    }
}
